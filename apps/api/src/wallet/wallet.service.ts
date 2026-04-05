import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { LedgerEntry, LedgerType, ReferenceType } from '../entities/ledger-entry.entity';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepo: Repository<LedgerEntry>,
    private readonly dataSource: DataSource,
  ) {}

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ where: { user_id: userId } });
    if (!wallet) {
      wallet = this.walletRepo.create({ user_id: userId });
      wallet = await this.walletRepo.save(wallet);
      this.logger.log(`Wallet created for user ${userId}`);
    }
    return wallet;
  }

  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      wallet_id: wallet.id,
      available_balance: Number(wallet.available_balance),
      held_balance: Number(wallet.held_balance),
      pending_balance: Number(wallet.pending_balance),
      total_balance: Number(wallet.available_balance) + Number(wallet.held_balance),
      currency: wallet.currency,
      is_active: wallet.is_active,
    };
  }

  async credit(
    userId: string,
    amount: number,
    referenceType: ReferenceType,
    referenceId?: string,
    description?: string,
  ): Promise<LedgerEntry> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return this.dataSource.transaction(async (manager) => {
      let wallet = await manager.findOne(Wallet, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        wallet = manager.create(Wallet, { user_id: userId });
        wallet = await manager.save(wallet);
      }

      if (!wallet.is_active) throw new BadRequestException('Wallet is inactive');

      wallet.available_balance = Number(wallet.available_balance) + amount;
      await manager.save(wallet);

      const entry = manager.create(LedgerEntry, {
        wallet_id: wallet.id,
        type: 'credit' as LedgerType,
        amount,
        balance_after: wallet.available_balance,
        reference_type: referenceType,
        reference_id: referenceId,
        description: description || `${referenceType} credit`,
      });
      const saved = await manager.save(entry);

      this.logger.log(`Credit R${amount} to wallet ${wallet.id} (${referenceType})`);
      return saved;
    });
  }

  async debit(
    userId: string,
    amount: number,
    referenceType: ReferenceType,
    referenceId?: string,
    description?: string,
  ): Promise<LedgerEntry> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Wallet not found. Please deposit funds first.');
      if (!wallet.is_active) throw new BadRequestException('Wallet is inactive');

      if (Number(wallet.available_balance) < amount) {
        throw new BadRequestException(
          `Insufficient balance. Available: R${wallet.available_balance}, Required: R${amount}`,
        );
      }

      wallet.available_balance = Number(wallet.available_balance) - amount;
      await manager.save(wallet);

      const entry = manager.create(LedgerEntry, {
        wallet_id: wallet.id,
        type: 'debit' as LedgerType,
        amount,
        balance_after: wallet.available_balance,
        reference_type: referenceType,
        reference_id: referenceId,
        description: description || `${referenceType} debit`,
      });
      const saved = await manager.save(entry);

      this.logger.log(`Debit R${amount} from wallet ${wallet.id} (${referenceType})`);
      return saved;
    });
  }

  async holdFunds(userId: string, amount: number, referenceId?: string): Promise<void> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (Number(wallet.available_balance) < amount) {
        throw new BadRequestException('Insufficient available balance to hold');
      }

      wallet.available_balance = Number(wallet.available_balance) - amount;
      wallet.held_balance = Number(wallet.held_balance) + amount;
      await manager.save(wallet);

      // Create ledger entry for hold
      const entry = manager.create(LedgerEntry, {
        wallet_id: wallet.id,
        type: 'debit' as LedgerType,
        amount,
        balance_after: wallet.available_balance,
        reference_type: 'escrow_fund' as ReferenceType,
        reference_id: referenceId,
        description: 'Funds held for escrow',
        metadata: { operation: 'hold', held_balance: Number(wallet.held_balance) },
      });
      await manager.save(entry);

      this.logger.log(`Held R${amount} in wallet ${wallet.id}`);
    });
  }

  async releaseFunds(userId: string, amount: number, referenceId?: string): Promise<void> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (Number(wallet.held_balance) < amount) {
        throw new BadRequestException('Insufficient held balance');
      }

      wallet.held_balance = Number(wallet.held_balance) - amount;
      await manager.save(wallet);

      // Create ledger entry for release
      const entry = manager.create(LedgerEntry, {
        wallet_id: wallet.id,
        type: 'credit' as LedgerType,
        amount,
        balance_after: wallet.available_balance,
        reference_type: 'escrow_release' as ReferenceType,
        reference_id: referenceId,
        description: 'Held funds released',
        metadata: { operation: 'release', held_balance: Number(wallet.held_balance) },
      });
      await manager.save(entry);

      this.logger.log(`Released R${amount} from hold in wallet ${wallet.id}`);
    });
  }

  async getHistory(userId: string, page: number, limit: number) {
    const wallet = await this.getOrCreateWallet(userId);
    const [entries, total] = await this.ledgerRepo.findAndCount({
      where: { wallet_id: wallet.id },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: entries,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }
}
