import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Job } from './job.entity';

export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'free' })
  plan: PlanType;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  plan_status: string;

  @Column({ type: 'varchar', nullable: true })
  subscription_id: string;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Job, (job) => job.organization)
  jobs: Job[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
