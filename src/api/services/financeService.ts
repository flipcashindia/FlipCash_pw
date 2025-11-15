// src/api/services/financeService.ts
import { privateApiClient } from '../client/apiClient';
import { type WalletTransaction, type Paginated } from '../types/api';

/**
 * API 12: Partner Transaction History
 * GET /finance/transactions/
 */
const getPartnerTransactions = async (filters: { [key: string]: any }): Promise<Paginated<WalletTransaction>> => {
  const { data } = await privateApiClient.get('/finance/transactions/', { 
    params: filters,
  });
  console.log('get wallet transaction : ', data)
  return data;
};


const submitTopUpRequest = async (formData: FormData) => {
  // Use 'privateApiClient' or your named axios instance
  const { data } = await privateApiClient.post('/finance/topup-request/', formData, {
    headers: {
      // This header is crucial for file uploads
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};


export const financeService = {
  getPartnerTransactions,
  submitTopUpRequest
  // ... (add other functions like createTopupOrder, etc. later)
};