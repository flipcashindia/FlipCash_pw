// src/api/services/walletService.ts
/**
 * Wallet Service
 * Handles wallet operations, top-ups, and transaction history
 * 
 * USES: privateApiClient with Zustand auth store
 */

import { privateApiClient } from '../client/apiClient'
import type { AxiosResponse } from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface Wallet {
  id: string;
  owner_type: 'user' | 'partner' | 'company';
  owner_id: string;
  balance: string;
  blocked_balance: string;
  available_balance: string;
  currency: string;
  status: 'active' | 'frozen' | 'suspended' | 'closed';
  daily_withdrawal_limit: string;
  min_balance: string;
  frozen_at: string | null;
  frozen_reason: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  transaction_id: string;
  wallet_id: string;
  transaction_type: 'credit' | 'debit';
  category: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  reference_type: string;
  reference_id: string | null;
  description: string;
  metadata: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';
  created_at: string;
  completed_at: string | null;
}

export interface TransactionListParams {
  category?: string;
  transaction_type?: 'credit' | 'debit';
  status?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}

export interface TopUpCardRequest {
  amount: string;
  payment_method: 'card';
  return_url?: string;
}

export interface TopUpUPIRequest {
  amount: string;
  payment_method: 'upi';
  upi_id: string;
}

export interface TopUpManualRequest {
  amount: string;
  payment_method: 'bank_transfer';
  utr_number: string;
  transaction_screenshot: string; // Base64 or URL
  bank_name?: string;
  transaction_date?: string;
  remarks?: string;
}

export interface TopUpCardResponse {
  message: string;
  order_id: string;
  payment_session_id: string;
  payment_url: string;
  cf_order_id: string;
  amount: string;
}

export interface TopUpUPIResponse {
  message: string;
  order_id: string;
  upi_intent_url: string;
  qr_code_url: string;
  cf_order_id: string;
  amount: string;
}

export interface TopUpManualResponse {
  message: string;
  request_id: string;
  amount: string;
  status: 'pending_verification';
  estimated_approval_time: string;
}

export interface VerifyPaymentRequest {
  order_id: string;
}

export interface VerifyPaymentResponse {
  status: 'success' | 'pending' | 'failed';
  transaction_id?: string;
  amount?: string;
  wallet_balance?: string;
  message: string;
}

export interface WalletStats {
  total_credits: string;
  total_debits: string;
  total_topups: string;
  total_withdrawals: string;
  pending_topups: string;
  this_month_topups: string;
  last_topup_amount: string;
  last_topup_date: string | null;
}

// ============================================================================
// SERVICE
// ============================================================================

class WalletService {
  private readonly baseUrl = '/wallet';

  /**
   * Get wallet details
   */
  async getWallet(): Promise<Wallet> {
    const response: AxiosResponse<Wallet> = await privateApiClient.get(
      `${this.baseUrl}/`
    );
    return response.data;
  }

  /**
   * Get wallet balance (lightweight)
   */
  async getBalance(): Promise<{ balance: string; available_balance: string }> {
    const response: AxiosResponse<{ balance: string; available_balance: string }> = 
      await privateApiClient.get(`${this.baseUrl}/balance/`);
    return response.data;
  }

  /**
   * List transactions
   */
  async listTransactions(params?: TransactionListParams): Promise<{
    results: Transaction[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    const response = await privateApiClient.get(`${this.baseUrl}/transactions/`, {
      params,
    });
    return response.data;
  }

  /**
   * Get transaction details
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    const response: AxiosResponse<Transaction> = await privateApiClient.get(
      `${this.baseUrl}/transactions/${transactionId}/`
    );
    return response.data;
  }

  /**
   * Get wallet statistics
   */
  async getStats(): Promise<WalletStats> {
    const response: AxiosResponse<WalletStats> = await privateApiClient.get(
      `${this.baseUrl}/stats/`
    );
    return response.data;
  }

  /**
   * Top-up via Card (Cashfree)
   */
  async topUpCard(data: TopUpCardRequest): Promise<TopUpCardResponse> {
    const response: AxiosResponse<TopUpCardResponse> = await privateApiClient.post(
      `${this.baseUrl}/topup/card/`,
      data
    );
    return response.data;
  }

  /**
   * Top-up via UPI (Cashfree)
   */
  async topUpUPI(data: TopUpUPIRequest): Promise<TopUpUPIResponse> {
    const response: AxiosResponse<TopUpUPIResponse> = await privateApiClient.post(
      `${this.baseUrl}/topup/upi/`,
      data
    );
    return response.data;
  }

  /**
   * Top-up via Manual Bank Transfer
   * (Requires UTR number and screenshot proof)
   */
  async topUpManual(data: TopUpManualRequest): Promise<TopUpManualResponse> {
    const response: AxiosResponse<TopUpManualResponse> = await privateApiClient.post(
      `${this.baseUrl}/topup/manual/`,
      data
    );
    return response.data;
  }

  /**
   * Verify payment status
   */
  async verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const response: AxiosResponse<VerifyPaymentResponse> = await privateApiClient.post(
      `${this.baseUrl}/verify-payment/`,
      data
    );
    return response.data;
  }

  /**
   * Get pending top-up requests (manual)
   */
  async getPendingTopUps(): Promise<{
    id: string;
    amount: string;
    utr_number: string;
    status: string;
    created_at: string;
  }[]> {
    const response = await privateApiClient.get(
      `${this.baseUrl}/topup/pending/`
    );
    return response.data;
  }

  /**
   * Upload transaction screenshot
   * Returns CDN URL for the screenshot
   */
  async uploadScreenshot(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('screenshot', file);

    const response: AxiosResponse<{ url: string }> = await privateApiClient.post(
      `${this.baseUrl}/upload-screenshot/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Get QR code for bank transfer
   */
  async getBankQRCode(): Promise<{
    qr_code_url: string;
    account_number: string;
    ifsc_code: string;
    account_name: string;
    bank_name: string;
    upi_id: string;
  }> {
    const response = await privateApiClient.get(
      `${this.baseUrl}/bank-qr-code/`
    );
    return response.data;
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<{
    card: { enabled: boolean; processing_fee: string };
    upi: { enabled: boolean; processing_fee: string };
    bank_transfer: { enabled: boolean; processing_fee: string };
  }> {
    const response = await privateApiClient.get(
      `${this.baseUrl}/payment-methods/`
    );
    return response.data;
  }

  /**
   * Request payout (for partners)
   */
  async requestPayout(data: {
    amount: string;
    payout_method: 'bank_transfer' | 'upi';
    account_number?: string;
    ifsc_code?: string;
    upi_id?: string;
    beneficiary_name: string;
  }): Promise<{
    message: string;
    payout_id: string;
    amount: string;
    fee: string;
    net_amount: string;
    status: string;
  }> {
    const response = await privateApiClient.post(
      `${this.baseUrl}/payout/request/`,
      data
    );
    return response.data;
  }

  /**
   * Get payout history
   */
  async getPayouts(): Promise<any[]> {
    const response = await privateApiClient.get(
      `${this.baseUrl}/payouts/`
    );
    return response.data;
  }
}

export const walletService = new WalletService();