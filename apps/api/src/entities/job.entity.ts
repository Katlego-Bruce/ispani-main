import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export type JobStatus = 'draft' | 'open' | 'assigned' | 'in_progress' | 'completed' | 'disputed' | 'cancelled';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'uuid', nullable: true })
  worker_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'float', nullable: true })
  location_lat: number;

  @Column({ type: 'float', nullable: true })
  location_lng: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location_address: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  payment_amount: number;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: JobStatus;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @ManyToOne(() => Organization, (org) => org.jobs)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => User, (user) => user.jobs)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'worker_id' })
  worker: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
