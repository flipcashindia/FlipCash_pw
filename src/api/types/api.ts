// src/api/types/api.ts

/**
 * FlipCash API Types
 * These types match the backend Django REST Framework serializers exactly
 */

// === AUTHENTICATION & USER TYPES ===

/**
 * API 6.1: Partner Send OTP (Registration)
 */
export interface PartnerSignupSendOtpRequest {
  phone: string;
}

export interface PartnerSignupSendOtpResponse {
  success: boolean;
  data: {
    request_id: string;
    message: string;
    expires_in: number;
  };
}

/**
 * API 6.2: Partner Verify OTP (Registration)
 */
export interface PartnerSignupVerifyOtpRequest {
  phone: string;
  otp: string;
  request_id: string;
}

export interface PartnerSignupVerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    phone: string;
    verified: boolean;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * API 6.3: Partner Complete Signup
 */
export interface PartnerSignupCompleteRequest {
  full_name: string;
  email?: string;
  business_name: string;
  business_type: 'proprietorship' | 'partnership' | 'pvt_ltd' | 'llp' | 'individual' | 'company';
  city: string;
  state: string;
  pincode: string;
}

export interface PartnerSignupCompleteResponse {
  success: boolean;
  message: string;
  data: {
    partner_id: string;
    status: 'pending' | string;
    message: string;
    user: User;
    tokens: {
      access: string;
      refresh: string;
    };
  };
}

// === GENERAL ERROR TYPE ===
export interface ApiError {
  response: {
    data: {
      detail?: string;
      error?: string | { [key: string]: string[] };
      [key: string]: any;
    };
  };
}

/**
 * User Object (from accounts.serializers.UserSerializer)
 */
export interface User {
  id: string;
  phone: string;
  name: string | null;
  full_name?: string;
  email: string | null;
  role: 'consumer' | 'partner' | 'agent' | 'super_admin' | 'admin' | 'sales' | 'support' | 'finance' | 'compliance';
  is_phone_verified: boolean;
  is_email_verified: boolean;
  device_binding_id?: string;
  kyc_status?: 'pending' | 'in_review' | 'verified' | 'rejected';
  profile_completed?: boolean;
  profile_completion_percentage?: number;
  wallet?: {
    id: string;
    balance: string;
    currency: string;
    status: string;
  };
  created_at: string;
  updated_at?: string;
  last_login_at?: string | null;
  partner_profile?: {
    id: string;
    business_name: string;
    status: string;
    is_active: boolean;
  };
}

/**
 * Partner Profile (from partners.serializers.PartnerSerializer)
 */
export interface PartnerProfile {
  id: string;
  user: {
    id: string;
    phone: string;
    name: string;
    full_name?: string;
  };
  status: 'pending' | 'under_review' | 'approved' | 'suspended' | 'rejected';
  business_name: string;
  service_radius_km: string;
  price_range_min: string;
  price_range_max: string;
  partner_score: string;
  completion_rate: string;
  average_rating: string;
  total_leads_completed: number;
  is_available: boolean;
  is_active?: boolean;
  background_check_status: 'pending' | 'in_progress' | 'verified' | 'failed';
  profile_completion_percentage?: number;
  profile_completed?: boolean;
  wallet?: {
    id: string;
    balance: string;
    currency: string;
    status: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Assigned Partner (nested in Lead responses)
 */
export interface AssignedPartner {
  id: string;
  business_name: string;
  average_rating: string;
  background_check_status: string;
  completion_rate: string;
  created_at: string;
  is_available: boolean;
  partner_score: string;
  price_range_max: string;
  price_range_min: string;
  profile_completed: boolean;
  service_radius_km: string;
  status: string;
  total_leads_completed: number;
  updated_at: string;
  user: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface IPartnerMetricDetails {
  leads_claimed: number;
  leads_completed: number;
  leads_rejected: number;
  completion_rate: string;
  average_rating: string;
  response_time_minutes: string;
  earnings: string;
  fees_paid: string;
}

export interface IMetricDateRange {
  from: string;
  to: string;
}

export interface PartnerMetrics {
  partner_id: string;
  date_range: IMetricDateRange;
  metrics: IPartnerMetricDetails;
}

/**
 * API 1.2: Update Partner Profile (Request)
 */
export interface PartnerUpdatePayload {
  business_name?: string;
  service_radius_km?: number;
  price_range_min?: number;
  price_range_max?: number;
}

/**
 * API 1.3: Toggle Availability
 */
export interface PartnerToggleAvailabilityRequest {
  is_available: boolean;
}

export interface PartnerToggleAvailabilityResponse {
  is_available: boolean;
  message: string;
}

/**
 * Partner Documents
 */
export interface PartnerDocument {
  id: string;
  document_type: 'aadhaar' | 'pan' | 'gst' | 'business_license' | 'address_proof' | 'photo';
  document_url: string;
  verification_status: 'pending' | 'in_review' | 'verified' | 'rejected';
  verification_notes: string;
}

export type PartnerDocumentType = 'aadhaar' | 'pan' | 'gst' | 'business_license' | 'address_proof' | 'photo';

/**
 * Bank Accounts
 */
export interface PartnerBankAccount {
  id: string;
  account_holder_name: string;
  account_number_masked: string;
  ifsc_code: string;
  bank_name: string;
  is_verified: boolean;
  is_primary: boolean;
  account_type: 'savings' | 'current';
}

export interface AddBankAccountRequest {
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name?: string;
  account_type: 'savings' | 'current';
}

/**
 * Service Areas
 */
export interface ServiceArea {
  id: string;
  name: string;
  center_latitude: string;
  center_longitude: string;
  radius_km: string;
  city: string;
  state: string;
  postal_codes: string[];
  is_active: boolean;
}

export interface CreateServiceAreaRequest {
  name: string;
  center_latitude: number;
  center_longitude: number;
  radius_km: number;
  city?: string;
  state?: string;
  postal_codes?: string[];
}

/**
 * KYC
 */
export interface UserKYC {
  id: string;
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  document_type: 'pan' | 'aadhaar' | 'driving_license' | 'passport' | 'voter_id' | '';
  document_number: string;
  document_front_image: string | null;
  document_back_image: string | null;
  selfie_image: string | null;
  verification_notes: string;
}

// === LEAD STATUS ===

/**
 * Lead Status Constants (matches backend LeadStatus.choices)
 */
export const LeadStatus = {
  BOOKED: 'booked',
  PARTNER_ASSIGNED: 'partner_assigned',
  EN_ROUTE: 'en_route',
  CHECKED_IN: 'checked_in',
  INSPECTING: 'inspecting',
  OFFER_MADE: 'offer_made',
  NEGOTIATING: 'negotiating',
  ACCEPTED: 'accepted',
  PAYMENT_PROCESSING: 'payment_processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
  EXPIRED: 'expired',
} as const;

export type LeadStatusType = typeof LeadStatus[keyof typeof LeadStatus];

// === PAGINATED RESPONSE ===

/**
 * Paginated Response (DRF standard)
 */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// === ADDRESS ===

/**
 * Address Interface (from accounts.serializers.AddressSerializer)
 * Field names match backend UserAddress model
 */
export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  latitude?: string | null;
  longitude?: string | null;
  type?: 'home' | 'work' | 'other';
  is_default?: boolean;
  created_at?: string;
}

// === DEVICE MODEL ===

/**
 * Device Model Interface (from catalog.serializers.DeviceModelListSerializer)
 */
export interface DeviceModel {
  id: string;
  name: string;
  brand_name: string;
  brand_logo?: string;
  category_name: string;
  model_number?: string;
  slug: string;
  thumbnail?: string;
  base_price: string;
  launch_year?: number | null;
  storage_options: string[];
  color_options: string[];
  is_featured: boolean;
}

// === LEAD TYPES ===

/**
 * Available Lead Interface (for partner browsing)
 * Matches backend AvailableLeadSerializer + LeadDetailSerializer fields
 */
export interface AvailableLead {
  id: string;
  lead_number: string;
  device_model: DeviceModel | null;
  device_name?: string;
  brand_name: string;
  storage: string;
  ram?: string;
  color?: string;
  estimated_price: string;
  pickup_address: Address;
  distance_km?: string;
  days_old: number;
  preferred_date: string;
  preferred_time_slot: string;
  pickup_date_display?: string;
  created_at: string;
  booked_at?: string;
  age_hours?: number;
  status: LeadStatusType;
  is_urgent?: boolean;
  is_expired?: boolean;
  priority_score?: number;
}

/**
 * My Lead Interface (for partner's claimed leads)
 * Matches backend LeadDetailSerializer response structure
 * Based on actual API response from console log
 */
export interface MyLead {
  id: string;
  lead_number: string;
  
  // User/Customer info (from UserSerializer)
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role?: string;
    is_phone_verified?: boolean;
    is_email_verified?: boolean;
    device_binding_id?: string;
    created_at?: string;
    updated_at?: string;
  };
  
  // Device info (from DeviceModelListSerializer)
  device_model: DeviceModel | null;
  device_name?: string;
  brand_name: string;
  
  // Device specifications
  storage: string;
  ram?: string;
  color?: string;
  imei_primary?: string;
  imei_secondary?: string;
  serial_number?: string;
  
  // Condition data
  condition_responses?: Record<string, any>;
  device_photos?: string[];
  
  // Pricing
  estimated_price: string;
  quoted_price: string | null;
  final_price: string | null;
  pricing_version?: string;
  claim_fee_deducted?: string;
  
  // Status
  status: LeadStatusType;
  status_display: string;
  is_flagged?: boolean;
  is_urgent?: boolean;
  is_expired?: boolean;
  flagged_reason?: string;
  priority_score?: number;
  
  // Pickup details (from AddressSerializer)
  pickup_address: Address;
  preferred_date: string;
  preferred_time_slot: string;
  pickup_date_display?: string;
  actual_pickup_date?: string | null;
  
  // Partner assignment
  assigned_partner?: AssignedPartner | null;
  assigned_at: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  booked_at?: string;
  completed_at?: string | null;
  expires_at?: string;
  
  // Counts
  days_old?: number;
  messages_count?: number;
  offers_count?: number;
  unread_messages_count?: number;
  
  // Notes/Reasons
  customer_notes?: string;
  internal_notes?: string;
  cancellation_reason?: string;
  rejection_reason?: string;
  
  // Latest offer (if any)
  latest_offer?: LeadOffer | null;
}

/**
 * Lead Details Interface (full lead detail view)
 */
export interface LeadDetails extends MyLead {
  // Visit info (if visit exists)
  visit?: {
    id: string;
    visit_number?: string;
    status?: string;
    status_display?: string;
  } | null;
}

// === OFFER TYPES ===

/**
 * Offer Status Constants
 */
export const OfferStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COUNTERED: 'countered',
  EXPIRED: 'expired',
  WITHDRAWN: 'withdrawn',
} as const;

export type OfferStatusType = typeof OfferStatus[keyof typeof OfferStatus];

/**
 * Lead Offer Interface
 */
export interface LeadOffer {
  id: string;
  lead: string;
  partner: string;
  system_calculated_price: string;
  partner_offered_price: string;
  price_deviation_percentage: string;
  message?: string;
  inspection_findings?: Record<string, any>;
  inspection_photos?: string[];
  status: OfferStatusType;
  customer_response?: string;
  created_at: string;
  expires_at: string;
  responded_at?: string | null;
}

// === VISIT TYPES ===

/**
 * Visit Checklist Item
 */
export interface VisitChecklistItem {
  id: string;
  check_type: string;
  attribute: string;
  question: string;
  status: 'pass' | 'fail' | 'na' | 'pending';
  notes: string;
  value?: string;
}

/**
 * Visit Details
 */
export interface VisitDetails {
  id: string;
  visit_number: string;
  lead: { 
    id: string; 
    lead_number: string;
  };
  status: 'scheduled' | 'en_route' | 'arrived' | 'inspecting' | 'inspection_completed' | 'completed' | 'cancelled';
  status_display: string;
  is_code_verified: boolean;
}

/**
 * Visit Checklist Update Payload
 */
export interface VisitChecklistUpdatePayload {
  status: 'pass' | 'fail' | 'na';
  notes?: string;
  value?: string;
}

// === WALLET TYPES ===

/**
 * Wallet Transaction
 */
export interface WalletTransaction {
  id: string;
  transaction_id: string;
  transaction_type: 'credit' | 'debit';
  category: 'topup' | 'payment' | 'payout' | 'commission' | 'refund';
  amount: string;
  balance_after: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

/**
 * Wallet Info (used in claim responses)
 */
export interface WalletInfo {
  claim_fee_deducted: string;
  purchase_amount_blocked: string;
  total_balance: string;
  blocked_balance: string;
  available_balance: string;
}

// === CLAIM RESPONSE TYPES ===

/**
 * Claim Lead Response
 */
export interface ClaimLeadResponse {
  message: string;
  lead_id: string;
  lead_number: string;
  visit_id: string;
  visit_number: string;
  verification_code: string;
  wallet_info: WalletInfo;
  customer: {
    name: string;
    phone: string;
  };
  pickup_address: Address;
  scheduled_date: string;
  scheduled_time_slot: string;
}

/**
 * Cancel Claim Response
 */
export interface CancelClaimResponse {
  message: string;
  refunded_amount: string;
  claim_fee_not_refunded: string;
  wallet_info: WalletInfo;
}

// === STATS TYPES ===

/**
 * Lead Statistics (for customer)
 */
export interface LeadStats {
  total_leads: number;
  active_leads: number;
  completed_leads: number;
  cancelled_leads: number;
  total_earnings: string;
  average_price: string;
}

/**
 * Partner Lead Statistics
 */
export interface PartnerLeadStats {
  total_claimed: number;
  completed: number;
  in_progress: number;
  completion_rate: string;
  average_response_time_minutes: number;
  total_earnings: string;
}