// src/api/services/accountService.ts
import { privateApiClient } from '../client/apiClient';
import { type UserKYC } from '../../api/types/api';

/**
 * API 4.1 (Accounts): Get User's KYC Details
 */
const getKyc = async (): Promise<UserKYC> => {
  const { data } = await privateApiClient.get('/accounts/kyc/'); //
  return data;
};

/**
 * API 4.2 (Accounts): Upload/Update KYC Documents
 */
const uploadKyc = async (formData: FormData): Promise<UserKYC> => {
  // FormData must contain 'document_type', 'document_number', 'document_front_image', etc.
  const { data } = await privateApiClient.patch('/accounts/kyc/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }, //
  });
  return data;
};

export const accountService = {
  getKyc,
  uploadKyc,
};