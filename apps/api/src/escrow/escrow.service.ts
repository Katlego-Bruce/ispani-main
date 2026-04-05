import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Escrow } from '../entities/escrow.entity';
import { EscrowEvent, EscrowEventType } from '../entities/escrow-event.entity';
import { WalletService } from '../wallet/wallet.service';

const PLATFORM_FEE_RATE = 0.05; // 5% platform fee

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    @InjectRepository(Escrow)
    private readonly escrowRepo: Repository<Escrow>,
    @InjectRepository(EscrowEvent)
    private readonly eventRepo: Repository<EscrowEvent>,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) {}

  async create(jobId: string, funderId: string, amount: number, recipientId?: string) {
    const existing = await this.escrowRepo.findOne({ where: { job_id: jobId } });
    if (existing) throw new BadRequestException('Escrow already exists for this job');

    if (amount < 50) throw new BadRequestException('Minimum escrow amount is R50');

    const platformFee = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;

    return this.dataSource.transaction(async (manager) => {
      const escrow = manager.create(Escrow, {
        job_id: jobId,
        funder_id: funderId,
        recipient_id: recipientId,
        amount,
        platform_fee: platformFee,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      const saved = await manager.save(escrow);

      await this.logEventInTx(manager, saved.id, 'created', amount, funderId, 'Escrow created');
      this.logger.log(`Escrow created: ${saved.id} for job ${jobId}, amount: R${amount}`);
      return saved;
    });
  }

  async fund(escrowId: string, actorId: string) {
    return this.dataSource.transaction(async (manager) => {
      const escrow = await manager.findOne(Escrow, {
        where: { id: escrowId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!escrow) throw new NotFoundException('Escrow not found');
      if (escrow.status !== 'pending') {
        throw new BadRequestException(`Cannot fund escrow in '${escrow.status}' status`);
      }

      await this.walletService.debit(
        escrow.funder_id,
        Number(escrow.amount),
        'escrow_fund',
        escrow.id,
        `Escrow funding for job ${escrow.job_id}`,
      );

      escrow.status = 'funded';
      escrow.funded_at = new Date();
      await manager.save(escrow);

      await this.logEventInTx(manager, escrow.id, 'funded', Number(escrow.amount), actorId, 'Escrow funded from wallet');
      this.logger.log(`Escrow funded: ${escrow.id}, amount: R${escrow.amount}`);
      return escrow;
    });
  }

  async release(escrowId: string, actorId: string) {
    return this.dataSource.transaction(async (manager) => {
      const escrow = await manager.findOne(Escrow, {
        where: { id: escrowId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!escrow) throw new NotFoundException('Escrow not found');
      if (escrow.status !== 'funded') {
        throw new BadRequestException(`Cannot release escrow in '${escrow.status}' status`);
      }
      if (!escrow.recipient_id) {
        throw new BadRequestException('No recipient assigned to this escrow');
      }

      const releaseAmount = Number(escrow.amount) - Number(escrow.platform_fee);

      await this.walletService.credit(
        escrow.recipient_id,
        releaseAmount,
        'escrow_release',
        escrow.id,
        `Payment for job ${escrow.job_id} (after 5% platform fee)`,
      );

      escrow.status = 'released';
      escrow.released_amount = releaseAmount;
      escrow.released_at = new Date();
      await manager.save(escrow);

      await this.logEventInTx(manager, escrow.id, 'released', releaseAmount, actorId, `Released R${releaseAmount} to worker`);
      await this.logEventInTx(manager, escrow.id, 'fee_deducted', Number(escrow.platform_fee), actorId, `Platform fee: R${escrow.platform_fee}`);

      this.logger.log(`Escrow released: ${escrow.id}, paid: R${releaseAmount}, fee: R${escrow.platform_fee}`);
      return escrow;
    });
  }

  async refund(escrowId: string, actorId: string) {
    return this.dataSource.transaction(async (manager) => {
      const escrow = await manager.findOne(Escrow, {
        where: { id: escrowId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!escrow) throw new NotFoundException('Escrow not found');
      if (escrow.status !== 'funded') {
        throw new BadRequestException(`Cannot refund escrow in '${escrow.status}' status`);
      }

      await this.walletService.credit(
        escrow.funder_id,
        Number(escrow.amount),
        'escrow_refund',
        escrow.id,
        `Full refund for job ${escrow.job_id}`,
      );

      escrow.status = 'refunded';
      await manager.save(escrow);

      await this.logEventInTx(manager, escrow.id, 'refunded', Number(escrow.amount), actorId, 'Full refund issued to funder');
      this.logger.log(`Escrow refunded: ${escrow.id}, amount: R${escrow.amount}`);
      return escrow;
    });
  }

  async dispute(escrowId: string, actorId: string, reason: string) {
    return this.dataSource.transaction(async (manager) => {
      const escrow = await manager.findOne(Escrow, {
        where: { id: escrowId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!escrow) throw new NotFoundException('Escrow not found');
      if (!['funded', 'released'].includes(escrow.status)) {
        throw new BadRequestException(`Cannot dispute escrow in '${escrow.status}' status`);
      }

      escrow.status = 'disputed';
      await manager.save(escrow);

      await this.logEventInTx(manager, escrow.id, 'disputed', null, actorId, reason);
      this.logger.warn(`Escrow disputed: ${escrow.id}, reason: ${reason}`);
      return escrow;
    });
  }

  async findByJob(jobId: string) {
    const escrow = await this.escrowRepo.findOne({
      where: { job_id: jobId },
      relations: ['events'],
    });
    if (!escrow) throw new NotFoundException('Escrow not found for this job');
    return escrow;
  }

  async findOne(id: string) {
    const escrow = await this.escrowRepo.findOne({
      where: { id },
      relations: ['events', 'job'],
    });
    if (!escrow) throw new NotFoundException('Escrow not found');
    return escrow;
  }

  private async logEventInTx(
    manager: EntityManager,
    escrowId: string,
    eventType: EscrowEventType,
    amount: number | null,
    actorId: string,
    description: string,
  ) {
    const event = manager.create(EscrowEvent, {
      escrow_id: escrowId,
      event_type: eventType,
      amount,
      actor_id: actorId,
      description,
    });
    return manager.save(event);
  }
}
