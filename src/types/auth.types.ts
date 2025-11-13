export interface User {
  id: string;
  mobile: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: 'customer' | 'partner' | 'admin';
  is_active: boolean;
  kyc_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  mobile: string;
  otp: string;
  request_id: string;
}

export interface OTPRequest {
  phone: string;
  purpose: string;
}

export interface OTPResponse {
  request_id: string;
  message: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}