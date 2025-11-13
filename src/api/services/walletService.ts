import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { type Wallet, type Transaction, type WalletStatistics, type TopUpRequest, type TopUpResponse } from '../../types/wallet.types';

export const walletService = {
  async getMyWallet(): Promise<{ wallet: Wallet; statistics: WalletStatistics }> {
    const response = await apiClient.get(API_ENDPOINTS.WALLET.MY_WALLET);
    return response.data;
  },

  async getBalance(): Promise<{ balance: number }> {
    const response = await apiClient.get(API_ENDPOINTS.WALLET.BALANCE);
    return response.data;
  },

  async getTransactions(params?: any): Promise<Transaction[]> {
    const response = await apiClient.get(API_ENDPOINTS.WALLET.TRANSACTIONS, { params });
    return response.data.results || response.data;
  },

  async getTransactionDetail(id: string): Promise<Transaction> {
    const response = await apiClient.get(API_ENDPOINTS.WALLET.TRANSACTION_DETAIL(id));
    return response.data;
  },

  async topUp(data: TopUpRequest): Promise<TopUpResponse> {
    const response = await apiClient.post(API_ENDPOINTS.WALLET.TOP_UP, data);
    return response.data;
  },

  async getStatistics(): Promise<WalletStatistics> {
    const response = await apiClient.get(API_ENDPOINTS.WALLET.STATISTICS);
    return response.data;
  },
};