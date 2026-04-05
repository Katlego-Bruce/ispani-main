import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { LedgerEntry } from './ledger-entry.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  available_balance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  held_balance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pending_balance: number;

  @Column({ type: 'varchar', length: 3, default: 'ZAR' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => LedgerEntry, (entry) => entry.wallet)
  ledger_entries: LedgerEntry[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
