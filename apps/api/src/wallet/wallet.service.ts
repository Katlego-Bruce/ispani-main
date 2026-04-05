import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { LedgerEntry, LedgerType, ReferenceType } from '../entities/ledger-entry.entity';

@Injectable()
export class WalletService {
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
    }
    return wallet;
  }

  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      available_balance: Number(wallet.available_balance),
      held_balance: Number(wallet.held_balance),
      pending_balance: Number(wallet.pending_balance),
      total_balance: Number(wallet.available_balance) + Number(wallet.held_balance),
      currency: wallet.currency,
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
      const wallet = await manager.findOne(Wallet, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');

      wallet.available_balance = Number(wallet.available_balance) + amount;
      await manager.save(wallet);

      const entry = manager.create(LedgerEntry, {
        wallet_id: wallet.id,
        type: 'credit' as LedgerType,
        amount,
        balance_after: wallet.available_balance,
        reference_type: referenceType,
        reference_id: referenceId,
        description,
      });
      return manager.save(entry);
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
      if (!wallet) throw new NotFoundException('Wallet not found');

      if (Number(wallet.available_balance) < amount) {
        throw new BadRequestException('Insufficient balance');
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
        description,
      });
      return manager.save(entry);
    });
  }

  async holdFunds(userId: string, amount: number): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (Number(wallet.available_balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }
      wallet.available_balance = Number(wallet.available_balance) - amount;
      wallet.held_balance = Number(wallet.held_balance) + amount;
      await manager.save(wallet);
    });
  }

  async releaseFunds(userId: string, amount: number): Promise<void> {
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
