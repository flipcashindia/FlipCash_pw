import apiClient, { setTokens, clearTokens } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { type OTPRequest, type OTPResponse, type LoginRequest, type LoginResponse } from '../../types/auth.types';

export const authService = {
  async requestOTP(data: OTPRequest): Promise<OTPResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REQUEST_OTP, data);
    return response.data;
  },

  async verifyOTP(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
    const { tokens } = response.data;
    setTokens(tokens.access, tokens.refresh);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      clearTokens();
    }
  },

  async refreshToken(refreshToken: string): Promise<string> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refresh: refreshToken,
    });
    return response.data.access;
  },
};