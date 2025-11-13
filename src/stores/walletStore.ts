import { create } from 'zustand';
import { type Wallet, type Transaction, type WalletStatistics } from '../types/wallet.types';

interface WalletStore {
  wallet: Wallet | null;
  transactions: Transaction[];
  statistics: WalletStatistics | null;
  isLoading: boolean;
  error: string | null;
  setWallet: (wallet: Wallet | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setStatistics: (statistics: WalletStatistics | null) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  updateBalance: (balance: number) => void;
  addTransaction: (transaction: Transaction) => void;
  clear: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallet: null,
  transactions: [],
  statistics: null,
  isLoading: false,
  error: null,
  setWallet: (wallet) => set({ wallet }),
  setTransactions: (transactions) => set({ transactions }),
  setStatistics: (statistics) => set({ statistics }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  updateBalance: (balance) =>
    set((state) => ({
      wallet: state.wallet ? { ...state.wallet, balance } : null,
    })),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  clear: () => set({ wallet: null, transactions: [], statistics: null, error: null }),
}));