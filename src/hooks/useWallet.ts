// src/hooks/useWallet.ts
/**
 * React Query Hooks for Wallet Operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../api/services/walletServices';
import { useWalletStore } from '../api/services/walletStores';
import type {
  TopUpCardRequest,
  TopUpUPIRequest,
  TopUpManualRequest,
  TransactionListParams,
} from '../api/services/walletServices'

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get wallet details
 */
export const useWalletQuery = () => {
  const setWallet = useWalletStore((state) => state.setWallet);

  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const wallet = await walletService.getWallet();
      setWallet(wallet);
      return wallet;
    },
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get wallet balance (lightweight)
 */
export const useWalletBalance = () => {
  const setBalance = useWalletStore((state) => state.setBalance);

  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const data = await walletService.getBalance();
      setBalance(data.balance, data.available_balance);
      return data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

/**
 * Get transactions
 */
export const useTransactions = (params?: TransactionListParams) => {
  const setTransactions = useWalletStore((state) => state.setTransactions);

  return useQuery({
    queryKey: ['wallet', 'transactions', params],
    queryFn: async () => {
      const data = await walletService.listTransactions(params);
      setTransactions(data.results);
      return data;
    },
  });
};

/**
 * Get transaction details
 */
export const useTransaction = (transactionId: string | undefined) => {
  return useQuery({
    queryKey: ['wallet', 'transactions', transactionId],
    queryFn: () => walletService.getTransaction(transactionId!),
    enabled: !!transactionId,
  });
};

/**
 * Get wallet statistics
 */
export const useWalletStats = () => {
  const setStats = useWalletStore((state) => state.setStats);

  return useQuery({
    queryKey: ['wallet', 'stats'],
    queryFn: async () => {
      const stats = await walletService.getStats();
      setStats(stats);
      return stats;
    },
  });
};

/**
 * Get pending top-up requests
 */
export const usePendingTopUps = () => {
  return useQuery({
    queryKey: ['wallet', 'pending-topups'],
    queryFn: () => walletService.getPendingTopUps(),
  });
};

/**
 * Get bank QR code
 */
export const useBankQRCode = () => {
  return useQuery({
    queryKey: ['wallet', 'bank-qr'],
    queryFn: () => walletService.getBankQRCode(),
  });
};

/**
 * Get payment methods
 */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['wallet', 'payment-methods'],
    queryFn: () => walletService.getPaymentMethods(),
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Top-up via Card
 */
export const useTopUpCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TopUpCardRequest) => walletService.topUpCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};

/**
 * Top-up via UPI
 */
export const useTopUpUPI = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TopUpUPIRequest) => walletService.topUpUPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};

/**
 * Top-up via Manual Bank Transfer
 */
export const useTopUpManual = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TopUpManualRequest) => walletService.topUpManual(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'pending-topups'] });
    },
  });
};

/**
 * Verify payment
 */
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => 
      walletService.verifyPayment({ order_id: orderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
  });
};

/**
 * Upload screenshot
 */
export const useUploadScreenshot = () => {
  return useMutation({
    mutationFn: (file: File) => walletService.uploadScreenshot(file),
  });
};

/**
 * Request payout
 */
export const useRequestPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => walletService.requestPayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'payouts'] });
    },
  });
};

// ============================================================================
// COMBINED HOOK
// ============================================================================

/**
 * Complete wallet hook with all data and actions
 */
export const useWallet = () => {
  const wallet = useWalletQuery();
  const balance = useWalletBalance();
  const stats = useWalletStats();

  const topUpCard = useTopUpCard();
  const topUpUPI = useTopUpUPI();
  const topUpManual = useTopUpManual();
  const verifyPayment = useVerifyPayment();
  const uploadScreenshot = useUploadScreenshot();

  return {
    // Data
    wallet: wallet.data,
    balance: balance.data,
    stats: stats.data,
    
    // Loading states
    isLoading: wallet.isLoading || balance.isLoading,
    isStatsLoading: stats.isLoading,
    
    // Errors
    error: wallet.error || balance.error,
    
    // Top-up actions
    topUpCard: (amount: string, returnUrl?: string) =>
      topUpCard.mutate({ amount, payment_method: 'card', return_url: returnUrl }),
    
    topUpUPI: (amount: string, upiId: string) =>
      topUpUPI.mutate({ amount, payment_method: 'upi', upi_id: upiId }),
    
    topUpManual: (amount: string, utrNumber: string, screenshot: string, data?: any) =>
      topUpManual.mutate({
        amount,
        payment_method: 'bank_transfer',
        utr_number: utrNumber,
        transaction_screenshot: screenshot,
        ...data,
      }),
    
    verifyPayment: (orderId: string) =>
      verifyPayment.mutate(orderId),
    
    uploadScreenshot: (file: File) =>
      uploadScreenshot.mutateAsync(file),
    
    // Mutation states
    isTopUpPending: topUpCard.isPending || topUpUPI.isPending || topUpManual.isPending,
    isVerifying: verifyPayment.isPending,
    isUploading: uploadScreenshot.isPending,
    
    // Refetch
    refetch: () => {
      wallet.refetch();
      balance.refetch();
    },
  };
};