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

export const financeService = {
  getPartnerTransactions,
  // ... (add other functions like createTopupOrder, etc. later)
};