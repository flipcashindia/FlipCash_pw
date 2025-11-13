import { useWalletStore } from '../stores/walletStore';
import { walletService } from '../api/services/walletService';
import { handleApiError } from '../utils/errorHandler';

export const useWallet = () => {
  const { wallet, transactions, statistics, isLoading, setWallet, setTransactions, setStatistics, setLoading, setError } = useWalletStore();

  const loadWallet = async () => {
    try {
      setLoading(true);
      const data = await walletService.getMyWallet();
      setWallet(data.wallet);
      setStatistics(data.statistics);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (params?: any) => {
    try {
      setLoading(true);
      const data = await walletService.getTransactions(params);
      setTransactions(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    try {
      const data = await walletService.getBalance();
      if (wallet) {
        setWallet({ ...wallet, balance: data.balance });
      }
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  return {
    wallet,
    transactions,
    statistics,
    isLoading,
    loadWallet,
    loadTransactions,
    refreshBalance,
  };
};