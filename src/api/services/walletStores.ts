// src/stores/walletStore.ts
/**
 * Wallet Store (Zustand)
 * Manages wallet state, balance, and transactions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Wallet, Transaction, WalletStats } from '../services/walletServices'

interface WalletState {
  // State
  wallet: Wallet | null;
  balance: string;
  availableBalance: string;
  transactions: Transaction[];
  stats: WalletStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setWallet: (wallet: Wallet) => void;
  setBalance: (balance: string, availableBalance: string) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setStats: (stats: WalletStats) => void;
  addTransaction: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  wallet: null,
  balance: '0.00',
  availableBalance: '0.00',
  transactions: [],
  stats: null,
  isLoading: false,
  error: null,
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      ...initialState,

      setWallet: (wallet) => set({ wallet, balance: wallet.balance, availableBalance: wallet.available_balance }),
      
      setBalance: (balance, availableBalance) => set({ balance, availableBalance }),
      
      setTransactions: (transactions) => set({ transactions }),
      
      setStats: (stats) => set({ stats }),
      
      addTransaction: (transaction) => 
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        wallet: state.wallet,
        balance: state.balance,
        availableBalance: state.availableBalance,
      }),
    }
  )
);