// src/api/types/partner.types.ts
// Based on the FlipCash Accounts API Documentation (Section 6)

export interface PartnerSendOTPRequest {
  phone: string;
}

export interface PartnerSendOTPResponse {
  success: boolean;
  data: {
    request_id: string; // This flow USES a request_id
    message: string;
    expires_in: number;
  };
}

export interface PartnerVerifyOTPRequest {
  phone: string;
  otp: string; // Your API doc uses 'otp' in the body
  request_id: string;
}

export interface PartnerVerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    phone: string;
    verified: boolean;
  };
}

export interface PartnerRegisterRequest {
  phone: string;
  full_name: string;
  email?: string;
  business_name: string;
  business_type: 'proprietorship' | 'partnership' | 'pvt_ltd' | 'llp' | 'individual';
  pan_number: string;
  gst_number?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PartnerRegisterResponse {
  success: boolean;
  message: string;
  data: {
    partner_id: string;
    status: 'pending';
    message: string;
  };
}