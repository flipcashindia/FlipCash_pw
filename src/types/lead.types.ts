import { type Address } from './common.types';

export interface Device {
  category: string;
  brand: string;
  model: string;
  storage?: string;
  ram?: string;
  color?: string;
  imei?: string;
  purchase_year?: number;
}

export interface DeviceCondition {
  age_category: 'less_than_6' | '6-11' | '12-18' | '18-24' | 'more_than_24';
  body_condition: 'flawless' | 'good' | 'average' | 'below_average';
  screen_condition: 'flawless' | 'minor_scratches' | 'major_scratches' | 'broken';
  functional_issues: string[];
  accessories: {
    charger: boolean;
    box: boolean;
    earphones: boolean;
    original_bill: boolean;
  };
  warranty_months: number;
}

export interface Lead {
  id: string;
  user: string;
  device: Device;
  condition: DeviceCondition;
  images: string[];
  address: Address;
  estimate_price: number;
  final_price?: number;
  status: 'new' | 'partner_assigned' | 'in_progress' | 'completed' | 'cancelled';
  partner?: string;
  partner_name?: string;
  claimed_at?: string;
  claim_fee?: number;
  scheduled_date?: string;
  scheduled_time_slot?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadFilters {
  status?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  city?: string;
  pincode?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface LeadStats {
  total_leads: number;
  active_leads: number;
  completed_leads: number;
  cancelled_leads: number;
  total_earnings: number;
}

export interface ClaimLeadResponse {
  success: boolean;
  message: string;
  claim_fee: number;
  new_wallet_balance: number;
  lead: Lead;
}

export interface LeadStatusHistory {
  id: string;
  lead: string;
  status: string;
  changed_by: string;
  changed_at: string;
  notes?: string;
}