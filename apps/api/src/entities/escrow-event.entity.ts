import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Escrow } from './escrow.entity';

export type EscrowEventType = 'created' | 'funded' | 'released' | 'partially_released' | 'refunded' | 'disputed' | 'expired' | 'fee_deducted';

@Entity('escrow_events')
export class EscrowEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  escrow_id: string;

  @Column({ type: 'varchar', length: 30 })
  event_type: EscrowEventType;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'uuid', nullable: true })
  actor_id: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Escrow, (escrow) => escrow.events)
  @JoinColumn({ name: 'escrow_id' })
  escrow: Escrow;

  @CreateDateColumn()
  created_at: Date;
}
