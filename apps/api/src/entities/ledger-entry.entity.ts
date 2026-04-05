import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export type LedgerType = 'credit' | 'debit';
export type ReferenceType = 'escrow_fund' | 'escrow_release' | 'escrow_refund' | 'payout' | 'deposit' | 'fee' | 'adjustment';

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  wallet_id: string;

  @Column({ type: 'varchar', length: 10 })
  type: LedgerType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balance_after: number;

  @Column({ type: 'varchar', length: 50 })
  reference_type: ReferenceType;

  @Column({ type: 'uuid', nullable: true })
  reference_id: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Wallet, (wallet) => wallet.ledger_entries)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @CreateDateColumn()
  created_at: Date;
}
