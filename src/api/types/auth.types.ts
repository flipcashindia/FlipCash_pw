/**
 * Authentication Types - Customer App Only
 * Based on FlipCash Accounts API Documentation
 */

// --- User & Auth Types ---

export interface UserWallet {
  id: string;
  balance: string;
  currency: "INR";
  status: "active" | "inactive";
}

// Based on GET /me/ and POST /auth/otp/verify/
export interface User {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
  role: 'consumer' | 'partner' | 'admin' | 'super_admin' | 'sales' | 'support' | 'finance' | 'compliance';
  is_active: boolean; // Not in doc, but good practice
  is_phone_verified: boolean;
  is_email_verified: boolean;
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected';
  kyc_verified_at: string | null;
  profile_completed: boolean;
  profile_completion_percentage: number;
  device_binding_id: string | null;
  last_login_ip: string | null;
  wallet: UserWallet;
  created_at: string;
  updated_at: string;
  last_login_at: string | null; // Renamed from last_login for clarity
}

// Based on POST /auth/otp/send/
export interface SendOTPRequest {
  phone: string;
  purpose: 'login' | 'registration' | 'phone_verification' | 'password_reset' | 'transaction_approval' | 'profile_update';
}

export interface SendOTPResponse {
  detail: string;
  expires_in: number;
  resend_after: number;
  max_attempts: number;
}

// Based on POST /auth/otp/verify/
export interface VerifyOTPRequest {
  phone: string;
  code: string; // The 6-digit OTP
  device_id?: string;
}

export interface VerifyOTPResponse {
  tokens: {
    access: string;
    refresh: string;
  };
  user: User;
  created: boolean;
}

// Based on POST /auth/token/refresh/
export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

// Based on POST /auth/logout/
export interface LogoutRequest {
  refresh: string;
}

// --- Address Types (Section 3) ---

// Based on GET /addresses/
export interface UserAddress {
  id: string;
  type: 'home' | 'office' | 'other';
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
}

// Based on POST /addresses/
export interface CreateAddressRequest {
  type: 'home' | 'office' | 'other';
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}


// --- KYC Types (Section 4) ---

// Based on GET /kyc/
export interface UserKYC {
  id: string;
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  document_type: 'pan' | 'aadhaar' | 'driving_license' | 'passport' | 'voter_id' | '';
  document_number: string;
  document_front_image: string | null;
  document_back_image: string | null;
  selfie_image: string | null;
  verification_notes: string;
  verified_at: string | null;
  verified_by: {
    id: string;
    name: string;
    role: string;
  } | null;
  created_at: string;
  updated_at: string;
}

// Based on PATCH /kyc/
export interface UploadKYCRequest {
  document_type: 'pan' | 'aadhaar' | 'driving_license' | 'passport' | 'voter_id';
  document_number: string;
  document_front_image: File;
  document_back_image?: File;
  selfie_image: File;
}

// --- Beneficiary/Payout Types (from authService.ts) ---
// These are likely from a /finance/ API, but are included
// here as authService.ts imports them.

export interface PayoutBeneficiary {
  id: string;
  wallet: string;
  account_type: 'bank' | 'upi';
  beneficiary_name: string;
  account_number: string;
  account_number_masked?: string;
  ifsc_code: string;
  bank_name: string;
  branch_name: string;
  upi_id: string;
  is_verified: boolean;
  verified_at: string | null;
  is_primary: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBeneficiaryRequest {
  account_type: 'bank' | 'upi';
  beneficiary_name: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  branch_name?: string;
  upi_id?: string;
}

export interface UpdateBeneficiaryRequest extends Partial<CreateBeneficiaryRequest> {}