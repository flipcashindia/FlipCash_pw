import { type Address } from './common.types';

export interface Partner {
  id: string;
  user: string;
  phone: string;
  full_name: string;
  email: string;
  business_name: string;
  business_type: 'individual' | 'company';
  pan_number: string;
  gstin?: string;
  is_active: boolean;
  kyc_status: 'pending' | 'submitted' | 'under_review' | 'verified' | 'rejected';
  kyc_verified_at?: string;
  kyc_rejection_reason?: string;
  rating: number;
  total_leads_completed: number;
  wallet_balance: number;
  city: string;
  state: string;
  pincode: string;
  business_address: Address;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  id: string;
  partner: string;
  document_type: 'aadhaar' | 'pan' | 'gstin' | 'business_proof' | 'address_proof' | 'bank_proof';
  document_number?: string;
  document_url: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceArea {
  id: string;
  partner: string;
  pincode: string;
  city: string;
  state: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  partner: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name?: string;
  account_type: 'savings' | 'current';
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UPIId {
  id: string;
  partner: string;
  upi_id: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerMetrics {
  total_leads_claimed: number;
  total_leads_completed: number;
  total_earnings: number;
  average_rating: number;
  completion_rate: number;
  active_leads: number;
}

export interface PartnerEarnings {
  today: number;
  this_week: number;
  this_month: number;
  total: number;
}