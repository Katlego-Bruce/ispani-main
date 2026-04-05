import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Job } from './job.entity';
import { EscrowEvent } from './escrow-event.entity';

export type EscrowStatus = 'pending' | 'funded' | 'released' | 'refunded' | 'disputed' | 'partially_released';

@Entity('escrows')
export class Escrow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  job_id: string;

  @Column({ type: 'uuid' })
  funder_id: string;

  @Column({ type: 'uuid', nullable: true })
  recipient_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  released_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  platform_fee: number;

  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: EscrowStatus;

  @Column({ type: 'timestamp', nullable: true })
  funded_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  released_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @OneToMany(() => EscrowEvent, (event) => event.escrow)
  events: EscrowEvent[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
