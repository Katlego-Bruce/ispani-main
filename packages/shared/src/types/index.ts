// User Types
export type UserType = 'worker' | 'client' | 'admin' | 'super_admin';
export type KycStatus = 'pending' | 'verified' | 'rejected';
export type JobStatus = 'draft' | 'open' | 'assigned' | 'in_progress' | 'completed' | 'disputed' | 'cancelled';
export type EscrowStatus = 'pending' | 'funded' | 'released' | 'refunded' | 'disputed';
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'escalated';
export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise';

export interface User {
  id: string;
  type: UserType;
  phone: string;
  email: string;
  kyc_status: KycStatus;
  trust_score: number;
  created_at: Date;
}

export interface Organization {
  id: string;
  name: string;
  plan: PlanType;
  plan_status: 'active' | 'inactive' | 'trial';
  subscription_id?: string;
  created_at: Date;
}

export interface Job {
  id: string;
  organization_id: string;
  client_id: string;
  title: string;
  description: string;
  location?: { lat: number; lng: number };
  payment_amount: number;
  status: JobStatus;
  created_at: Date;
}

export interface Wallet {
  user_id: string;
  available_balance: number;
  held_balance: number;
  pending_balance: number;
}
