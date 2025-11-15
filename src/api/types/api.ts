// src/types/api.ts

/**
 * API 6.1: Partner Send OTP (Registration)
 */
export interface PartnerSignupSendOtpRequest {
  phone: string; //
}

export interface PartnerSignupSendOtpResponse {
  success: boolean; //
  data: {
    request_id: string; //
    message: string; //
    expires_in: number; //
  };
}

/**
 * API 6.2: Partner Verify OTP (Registration)
 */
export interface PartnerSignupVerifyOtpRequest {
  phone: string; //
  otp: string; //
  request_id: string; //
}

export interface PartnerSignupVerifyOtpResponse {
  success: boolean; //
  message: string; //
  data: {
    phone: string; //
    verified: boolean; //
  };
}

/**
 * API 6.3: Partner Complete Signup
 */
/**
 * 💥 UPDATED: API 6.3: Partner Complete Signup
 * Removed 'phone' as the user is identified by the auth token.
 */
export interface PartnerSignupCompleteRequest {
  // phone: string; // <-- REMOVED: Backend gets this from the auth token
  full_name: string; //
  email?: string; //
  business_name: string; //
  business_type: 'proprietorship' | 'partnership' | 'pvt_ltd' | 'llp' | 'individual' | 'company'; //
  city: string; //
  state: string; //
  pincode: string; //
}

export interface PartnerSignupCompleteResponse {
  success: boolean;
  message: string;
  data: {
    partner_id: string;
    status: 'pending' | string;
    message: string;
    user: User; // <-- NEW
    tokens: { // <-- NEW
      access: string;
      refresh: string;
    };
  };
}

// General API Error Response
// === GENERAL ERROR TYPE ===
export interface ApiError {
  response: {
    data: {
      // For { "detail": "..." }
      detail?: string;
      
      // For { "error": "..." }
      // Or { "error": { "field": ["..."] } }
      error?: string | { [key: string]: string[] };
      
      // For { "phone": ["..."] }
      [key: string]: any; 
    };
  };
}

/**
 * API 1.2 / 2.1: User Object
 */
export interface User {
  id: string; //
  phone: string; //
  name: string | null; //
  full_name: string;
  email: string | null; //
  role: 'consumer' | 'partner' | 'super_admin' | 'admin' | 'sales' | 'support' | 'finance' | 'compliance'; //
  is_phone_verified: boolean; //
  is_email_verified: boolean; //
  kyc_status: 'pending' | 'in_review' | 'verified' | 'rejected'; //
  profile_completed: boolean; //
  profile_completion_percentage: number; //
  wallet: {
    id: string; //
    balance: string; //
    currency: string; //
    status: string; //
  };
  created_at: string; //
  last_login_at: string | null; //
  partner_profile?: { // This is included in the /me response for partners
    id: string;
    business_name: string;
    status: string;
    is_active: boolean;
  }
}

// // General API Error Response
// export interface ApiError {
//   response: {
//     data: {
//       // API 6.1/6.2 return 'error', API 6.3 returns 'error: {..}'
//       error: string | { [key: string]: string[] }; 
//     };
//   };
// }



/**
 * API 1.2 / 2.1: User Object
 */
// export interface User {
//   id: string; //
//   phone: string; //
//   name: string | null; //
//   email: string | null; //
//   role: 'consumer' | 'partner' | 'super_admin' | 'admin' | 'sales' | 'support' | 'finance' | 'compliance'; //
//   is_phone_verified: boolean; //
//   is_email_verified: boolean; //
//   kyc_status: 'pending' | 'in_review' | 'verified' | 'rejected'; //
//   profile_completed: boolean; //
//   profile_completion_percentage: number; //
//   wallet: {
//     id: string; //
//     balance: string; //
//     currency: string; //
//     status: string; //
//   };
//   created_at: string; //
//   last_login_at: string | null; //
//   partner_profile?: { // This is included in the /me response for partners
//     id: string;
//     business_name: string;
//     status: string;
//     is_active: boolean;
//   }
// }












/**
 * API 1.1: Get Partner Profile (Response)
 * GET /api/v1/partners/me/
 */
export interface PartnerProfile {
  id: string; //
  user: {
    id: string; //
    phone: string; //
    name: string; //
    full_name: string;
  };
  status: 'pending' | 'under_review' | 'approved' | 'suspended' | 'rejected'; //
  business_name: string; //
  service_radius_km: string; //
  price_range_min: string; //
  price_range_max: string; //
  partner_score: string; //
  completion_rate: string; //
  average_rating: string; //
  total_leads_completed: number; //
  is_available: boolean; //
  background_check_status: 'pending' | 'in_progress' | 'verified' | 'failed'; //
  profile_completion_percentage: number; //
  profile_completed: boolean; //
  wallet: {
    id: string; //
    balance: string; //
    currency: string; //
    status: string; //
  };
  created_at: string; //
  updated_at: string; //
  // phone: string;
  // full_name: string;
  // email: string;
  // business_type: 'individual' | 'company';
  // pan_number: string;
  // gstin?: string;
  // is_active: boolean;
  // kyc_status: 'pending' | 'submitted' | 'under_review' | 'verified' | 'rejected';
  // kyc_verified_at?: string;
  // kyc_rejection_reason?: string;
  // rating: number;
  // wallet_balance: number;
  // city: string;
  // state: string;
  // pincode: string;
  // business_address: ServiceArea;

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

/**
 * Interface for the nested 'date_range' object.
 */
export interface IMetricDateRange {
  from: string; // This will be a date-string or the literal "all_time"
  to: string;   // This will be a date-string or the literal "now"
}

/**
 * Main interface for the API response from getMyMatrics
 * This matches the shape of the JSON returned by MyMetricsView.
 */
export interface PartnerMetrics {
  partner_id: string;
  date_range: IMetricDateRange;
  metrics: IPartnerMetricDetails;
}


/**
 * API 1.2: Update Partner Profile (Request)
 * PATCH /api/v1/partners/me/
 */
export interface PartnerUpdatePayload {
  business_name?: string; //
  service_radius_km?: number; //
  price_range_min?: number; //
  price_range_max?: number; //
}

/**
 * API 1.3: Toggle Availability (Request)
 * PATCH /api/v1/partners/me/availability/
 */
export interface PartnerToggleAvailabilityRequest {
  is_available: boolean; //
}

export interface PartnerToggleAvailabilityResponse {
  is_available: boolean; //
  message: string; //
}

// --- Interfaces for Checklist ---

/**
 * API 2.1 (Partners): List Partner Documents (Response Item)
 */
export interface PartnerDocument {
  id: string; //
  document_type: 'aadhaar' | 'pan' | 'gst' | 'business_license' | 'address_proof' | 'photo'; //
  document_url: string; //
  verification_status: 'pending' | 'in_review' | 'verified' | 'rejected'; //
  verification_notes: string; //
}

/**
 * API 2.2 (Partners): Upload Document (Request)
 * This is FormData, so no interface, but we define the types
 */
export type PartnerDocumentType = 'aadhaar' | 'pan' | 'gst' | 'business_license' | 'address_proof' | 'photo'; //




/**
 * API 3.1: List Bank Accounts (Response Item)
 */
export interface PartnerBankAccount {
  id: string; //
  account_holder_name: string; //
  account_number_masked: string; //
  ifsc_code: string; //
  bank_name: string; //
  is_verified: boolean; //
  is_primary: boolean; //
  account_type: 'savings' | 'current'; //
}

/**
 * API 3.2 (Partners): Add Bank Account (Request)
 */
export interface AddBankAccountRequest {
  account_holder_name: string; //
  account_number: string; //
  ifsc_code: string; //
  bank_name: string; //
  branch_name?: string; //
  account_type: 'savings' | 'current'; //
}

// === SERVICE AREA APIS ===

/**
 * API 4.1 (Partners): List Service Areas (Response Item)
 */
export interface ServiceArea {
  id: string; //
  name: string; //
  center_latitude: string; //
  center_longitude: string; //
  radius_km: string; //
  city: string; //
  state: string; //
  postal_codes: string[]; //
  is_active: boolean; //
}

/**
 * API 4.2 (Partners): Create Service Area (Request)
 */
export interface CreateServiceAreaRequest {
  name: string; //
  center_latitude: number; //
  center_longitude: number; //
  radius_km: number; //
  city?: string; //
  state?: string; //
  postal_codes?: string[]; //
}

// === KYC APIS (from Accounts API) ===

/**
 * API 4.1 (Accounts): Get KYC Details (Response)
 */
export interface UserKYC {
  id: string; //
  status: 'pending' | 'submitted' | 'verified' | 'rejected'; //
  document_type: 'pan' | 'aadhaar' | 'driving_license' | 'passport' | 'voter_id' | ''; //
  document_number: string; //
  document_front_image: string | null; //
  document_back_image: string | null; //
  selfie_image: string | null; //
  verification_notes: string; //
}



// === PARTNER PROFILE APIS (From Partners API) ===
export interface PartnerProfile {
  id: string; 
  user: { id: string; phone: string; name: string; full_name: string; }; 
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
  background_check_status: 'pending' | 'in_progress' | 'verified' | 'failed'; 
  profile_completion_percentage: number; 
  profile_completed: boolean; 
  wallet: {
    id: string; 
    balance: string; 
    currency: string; 
    status: string; 
  };
}
export interface PartnerUpdatePayload {
  business_name?: string; // [cite: 1.2]
  service_radius_km?: number; // [cite: 1.2]
  price_range_min?: number; // [cite: 1.2]
  price_range_max?: number; // [cite: 1.2]
}
export interface PartnerToggleAvailabilityRequest {
  is_available: boolean; // [cite: 1.3]
}
export interface PartnerToggleAvailabilityResponse {
  is_available: boolean; // [cite: 1.3]
  message: string; // [cite: 1.3]
}

// === PARTNER DOCUMENT APIS ===
export interface PartnerDocument {
  id: string; 
  document_type: 'aadhaar' | 'pan' | 'gst' | 'business_license' | 'address_proof' | 'photo'; // [cite: 2.1, 2.2]
  document_url: string; 
  verification_status: 'pending' | 'in_review' | 'verified' | 'rejected'; 
  verification_notes: string; 
}
// export type PartnerDocumentType = 'aadhaar' | 'pan' | 'gst' | 'business_license' | 'address_proof' | 'photo'; // [cite: 2.2]

// === PARTNER BANK ACCOUNT APIS ===
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

// === PARTNER SERVICE AREA APIS ===
export interface ServiceArea {
  id: string; 
  name: string; 
  city: string; 
  state: string; 
  postal_codes: string[]; 
  is_active: boolean; 
  radius_km: string; 
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




// Define LeadStatus as a string literal type based on your Django LeadStatus choices
// 1. Define the LeadStatus lookup object for runtime access
export const LeadStatus = {
    BOOKED: 'booked',
    PARTNER_ASSIGNED: 'partner_assigned',
    EN_ROUTE: 'en_route',
    CHECKED_IN: 'checked_IN',
    INSPECTING: 'inspecting',
    OFFER_MADE: 'offer_made',
    NEGOTIATING: 'negotiating',
    ACCEPTED: 'accepted',
    PAYMENT_PROCESSING: 'payment_processing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const; // This tells TypeScript to treat the values as literals

// 2. Define the LeadStatus Type using the values from the object
// This creates a union type: 'booked' | 'partner_assigned' | ...
export type LeadStatusType = typeof LeadStatus[keyof typeof LeadStatus];



// Define the standard Paginated response structure
export interface Paginated<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
    // page_size?: number; // Optional based on API design
    // num_pages?: number; // Optional based on API design
    length:number;
}







// === ACCOUNTS KYC API ===
export interface UserKYC {
  id: string; 
  status: 'pending' | 'submitted' | 'verified' | 'rejected'; 
  document_type: 'pan' | 'aadhaar' | 'driving_license' | 'passport' | 'voter_id' | ''; // [cite: 4.1, 4.2]
  document_number: string; 
  document_front_image: string | null; 
  document_back_image: string | null; 
  selfie_image: string | null; 
  verification_notes: string; 
}

// === LEAD & VISIT TYPES ===
export interface LeadDevice {
  name: string; // [cite: 1.3]
  brand: { name: string }; // [cite: 1.3]
  category?: { name: string }; // [cite: 1.3]
}
// export type Paginated<T> = {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: T[];
// }
export interface AvailableLead {
  id: string; 
  lead_number: string; 
  device_model: LeadDevice; 
  device_name:string;
  storage: string; 
  estimated_price: string; 
  city: string; 
  pincode: string; 
  distance_km?: string; 
  days_old:string;
  preferred_date: string; 
  preferred_time_slot: string; 
  created_at: string; 
  age_hours: number; 
  status: string;
}
export interface MyLead {
  id: string; 
  lead_number: string; 
  customer_name: string; 
  customer_phone: string; 
  device_model: LeadDevice; 
  device_name:string;
  estimated_price: string; 
  quoted_price: string | null; 
  status: LeadStatusType; // Use the new enum
  status_display: string;
  pickup_address: { 
    address_line1: string;
    city: string;
    pincode: string;
  };
  preferred_date: string; 
  preferred_time_slot: string; 
  assigned_at: string; 
}
export interface LeadDetails {
  id: string; // [cite: 1.3]
  lead_number: string; // [cite: 1.3]
  user: { id: string; phone: string; name: string; }; // [cite: 1.3]
  device_model: LeadDevice; // [cite: 1.3]
  storage: string; // [cite: 1.3]
  ram: string; // [cite: 1.3]
  color: string; // [cite: 1.3]
  imei_primary: string; // [cite: 1.3]
  condition_responses: Record<string, any>; // [cite: 1.3]
  device_photos: { url: string; description: string }[]; // [cite: 1.3]
  estimated_price: string; // [cite: 1.3]
  final_price:string;
  quoted_price: string | null; // [cite: 1.3]
  status: string; // [cite: 1.3]
  status_display: string; // [cite: 1.3]
  assigned_partner: { id: string; business_name: string; } | null; // [cite: 1.3]
  pickup_address: { // [cite: 1.3]
    id: string;
    address_line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  preferred_date: string; // [cite: 1.3]
  preferred_time_slot: string; // [cite: 1.3]
  // This is populated by the checkin API [cite: 2.4]
  visit: {
    id: string;
  } | null;
}
export interface VisitChecklistItem {
  id: string; 
  check_type: string; 
  attribute: string; 
  question: string; 
  status: 'pass' | 'fail' | 'na' | 'pending'; 
  notes: string; 
  value?: string; 
}
export interface VisitDetails {
  id: string; // [cite: 1.2]
  visit_number: string; // [cite: 1.2]
  lead: { id: string; lead_number: string; }; // [cite: 1.2]
  status: 'scheduled' | 'en_route' | 'arrived' | 'inspecting' | 'inspection_completed' | 'completed' | 'cancelled'; // [cite: 1.2, 1.9]
  status_display: string; // [cite: 1.2]
  is_code_verified: boolean; // [cite: 1.2]
}

// === FINANCE / WALLET TYPES ===
export interface WalletTransaction {
  id: string; // [cite: 12]
  transaction_id: string; // [cite: 12]
  transaction_type: 'credit' | 'debit'; // [cite: 12]
  category: 'topup' | 'payment' | 'payout' | 'commission' | 'refund'; // [cite: 12]
  amount: string; // [cite: 12]
  balance_after: string; // [cite: 12]
  description: string; // [cite: 12]
  status: 'completed' | 'pending' | 'failed'; // [cite: 12]
  created_at: string; // [cite: 12]
}

// visitChecklistUpdatePayload

export interface VisitChecklistUpdatePayload {
  status: 'pass' | 'fail' | 'na'; // Status update is required
  notes?: string; // Optional notes/reason
  value?: string; // Optional field for measured values (e.g., battery health)
}


