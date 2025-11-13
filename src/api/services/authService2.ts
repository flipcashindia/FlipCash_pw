// src/api/authService.ts
import { publicApiClient, privateApiClient } from '../client/apiClient';
import { type User } from '../types/api';

// --- Type Definitions (from your API docs) ---
// You can move these to src/types/api.ts

/**
 * API 1.1: Send OTP (Login)
 */
interface SendLoginOtpRequest {
  phone: string; //
  purpose: 'login' | 'registration' | 'phone_verification' | 'password_reset' | 'transaction_approval' | 'profile_update'; //
}
interface SendLoginOtpResponse {
  detail: string; //
  expires_in: number; //
  resend_after: number; //
  max_attempts: number; //
}

/**
 * API 1.2: Verify OTP & Login
 */
interface VerifyLoginOtpRequest {
  phone: string; //
  code: string; //
  device_id?: string; //
}
export interface VerifyLoginOtpResponse {
  tokens: {
    access: string; //
    refresh: string; //
  };
  user: User; //
  created: boolean; //
}

/**
 * API 1.4: Refresh Token
 */
interface RefreshTokenRequest {
  refresh: string; //
}
interface RefreshTokenResponse {
  access: string; //
}

/**
 * API 1.5: Logout
 */
interface LogoutRequest {
  refresh: string; //
}

/**
 * API 2.1: Get Current User Profile
 */
export type GetMeResponse = User; //


// --- API Service Functions ---

/**
 * API 1.1: Send OTP for login
 */
const sendLoginOtp = async (payload: SendLoginOtpRequest): Promise<SendLoginOtpResponse> => {
  const { data } = await publicApiClient.post('/accounts/auth/otp/send/', payload); //
  return data;
};

/**
 * API 1.2: Verify OTP and Login
 */
const verifyLoginOtp = async (payload: VerifyLoginOtpRequest): Promise<VerifyLoginOtpResponse> => {
  const { data } = await publicApiClient.post('/accounts/auth/otp/verify/', payload); //
  console.log(data);
  
  return data;
};

/**
 * API 1.4: Refresh Access Token
 */
const refreshToken = async (payload: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
  const { data } = await publicApiClient.post('/accounts/auth/token/refresh/', payload); //
  return data;
};

/**
 * API 1.5: Logout (blacklists refresh token)
 */
const logout = async (payload: LogoutRequest): Promise<void> => {
  await privateApiClient.post('/accounts/auth/logout/', payload); //
};

/**
 * API 2.1: Get Current User details
 */
const getMe = async (): Promise<GetMeResponse> => {
  const { data } = await privateApiClient.get('/accounts/me/'); //
  return data;
};


export const authService = {
  sendLoginOtp,
  verifyLoginOtp,
  refreshToken,
  logout,
  getMe,
};