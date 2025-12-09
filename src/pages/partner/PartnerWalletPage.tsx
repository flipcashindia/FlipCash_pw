// src/components/partner/PartnerWalletPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowDownLeft, History, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { useWallet, useTransactions, usePayments } from '../../hooks/useFinance';
import { WalletBalanceCard, WalletStatsCard } from '../../components/wallet/WalletCard';
import { 
  TransactionList, 
  TransactionFilters, 
  TransactionDetailModal 
} from '../../components/wallet/TransactionList';
import { PaymentHistoryList } from '../../components/payment/PaymentComponents';
import { 
  Card, 
  PageHeader, 
  LoadingSpinner, 
  ErrorMessage, 
  Button 
} from '../../components/shared';
import type { Transaction, TransactionType, TransactionCategory, CashfreePayment } from '../../api/types/finance.types';
import LeadTransactionsView from './LeadTransactionsView';

type ActiveTab = 'transactions' | 'payments';

export const PartnerWalletPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Wallet data with safe defaults
  const { 
    data: walletData, 
    loading: walletLoading, 
    error: walletError, 
    refetch: refetchWallet 
  } = useWallet();
  
  // Transactions with safe default empty array
  const { 
    data: transactions, 
    loading: txLoading, 
    pagination: txPagination, 
    updateFilters, 
    loadMore 
  } = useTransactions();
  
  // Payments with safe default empty array
  const { 
    data: payments, 
    loading: pmtLoading 
  } = usePayments();

  // Ensure we always have arrays (extra safety)
  const safeTransactions = transactions || [];
  const safePayments = payments || [];
  const safePagination = txPagination || { count: 0, next: null, previous: null };

  const [activeTab, setActiveTab] = useState<ActiveTab>('transactions');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | 'all'>('all');

  const handleTopUp = () => {
    navigate('/partner/wallet/add-money');
  };

  const handleTypeChange = (type: TransactionType | 'all') => {
    setTypeFilter(type);
    if (updateFilters) {
      updateFilters({
        transaction_type: type === 'all' ? undefined : type,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
      });
    }
  };

  const handleCategoryChange = (category: TransactionCategory | 'all') => {
    setCategoryFilter(category);
    if (updateFilters) {
      updateFilters({
        transaction_type: typeFilter === 'all' ? undefined : typeFilter,
        category: category === 'all' ? undefined : category,
      });
    }
  };

  const handlePaymentClick = (payment: CashfreePayment) => {
    navigate(`/partner/wallet/payments/${payment.id}`);
  };

  // Loading state
  if (walletLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading wallet..." />
      </div>
    );
  }

  // Error state
  if (walletError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <ErrorMessage message={walletError} onRetry={refetchWallet} />
        </div>
      </div>
    );
  }

  // Get wallet balance safely
  const walletBalance = walletData?.wallet?.balance 
    ? parseFloat(walletData.wallet.balance) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <PageHeader
          title="Partner Wallet"
          subtitle="Manage your wallet balance for lead claims"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={refetchWallet}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          }
        />

        {/* Wallet Balance Card */}
        {walletData?.wallet && walletData?.statistics ? (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <WalletBalanceCard
              wallet={walletData.wallet}
              userType="partner"
              onTopUp={handleTopUp}
            />
            <WalletStatsCard statistics={walletData.statistics} />
          </div>
        ) : (
          <Card className="mb-6">
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Wallet Not Available</p>
                <p className="text-sm text-gray-500">Unable to load wallet data</p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleTopUp}
            className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FEC925] hover:bg-yellow-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[#1C1C1B]">Add Money</p>
              <p className="text-xs text-gray-500">Top-up wallet</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/partner/wallet/payments')}
            className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FEC925] hover:bg-yellow-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[#1C1C1B]">Payments</p>
              <p className="text-xs text-gray-500">View payment history</p>
            </div>
          </button>
        </div>

        {/* Low Balance Warning */}
        {walletBalance < 1000 && walletBalance >= 0 && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-yellow-800">Low Wallet Balance</p>
                <p className="text-sm text-yellow-700">
                  Your balance is low. Add money to continue claiming leads.
                </p>
              </div>
              <Button size="sm" onClick={handleTopUp}>
                Add Money
              </Button>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-[#FEC925] text-[#1C1C1B]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'payments'
                ? 'border-[#FEC925] text-[#1C1C1B]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Payments 
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'transactions' && (
          <>
            <LeadTransactionsView 
              leadId={'xyz'}
              // leadNumber="LEAD-001"  // Optional
            />
            <TransactionFilters
              selectedType={typeFilter}
              selectedCategory={categoryFilter}
              onTypeChange={handleTypeChange}
              onCategoryChange={handleCategoryChange}
            />
            <TransactionList
              transactions={safeTransactions}
              loading={txLoading}
              onTransactionClick={setSelectedTransaction}
              hasMore={safePagination.next !== null}
              onLoadMore={loadMore}
            />
            
          </>
        )}

        {activeTab === 'payments' && (
          <PaymentHistoryList
            payments={safePayments}
            loading={pmtLoading}
            onPaymentClick={handlePaymentClick}
          />
        )}

        {/* Transaction Detail Modal */}
        <TransactionDetailModal
          transaction={selectedTransaction}
          isOpen={selectedTransaction !== null}
          onClose={() => setSelectedTransaction(null)}
        />
      </div>
    </div>
  );
};

export default PartnerWalletPage;