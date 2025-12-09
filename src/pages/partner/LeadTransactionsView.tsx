// LeadTransactionsView.tsx
// Simple component to view all transactions for a specific lead
// Embedded in LeadDetailPage

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';


// ============================================================================
// TYPES
// ============================================================================

interface LeadTransaction {
  id: string;
  transaction_id: string;
  wallet_id: string;
  wallet_owner: 'customer' | 'partner' | 'flipcash';
  transaction_type: 'credit' | 'debit';
  category: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  completed_at: string | null;
  metadata: Record<string, any>;
}

interface LeadTransactionsSummary {
  total_transactions: number;
  total_credited: string;
  total_debited: string;
  customer_transactions: number;
  partner_transactions: number;
  transactions: LeadTransaction[];
}

// ============================================================================
// API FUNCTION
// ============================================================================
const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1' // 'https://api.flipcash.in/api/v1';

// const getAuthToken = () => {
//   return localStorage.getItem('access_token');
// };

const fetchLeadTransactions = async (leadId: string): Promise<LeadTransactionsSummary> => {
  const token = useAuthStore.getState().accessToken;
  const { data } = await axios.get(
    `${API_BASE_URL}/finance/transactions/?reference_type=lead&reference_id=${leadId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const transactions = data.results || data;

  // Calculate summary
  const totalCredited = transactions
    .filter((t: LeadTransaction) => t.transaction_type === 'credit')
    .reduce((sum: number, t: LeadTransaction) => sum + parseFloat(t.amount), 0);

  const totalDebited = transactions
    .filter((t: LeadTransaction) => t.transaction_type === 'debit')
    .reduce((sum: number, t: LeadTransaction) => sum + parseFloat(t.amount), 0);

  const customerTxns = transactions.filter(
    (t: LeadTransaction) => t.wallet_owner === 'customer'
  ).length;

  const partnerTxns = transactions.filter(
    (t: LeadTransaction) => t.wallet_owner === 'partner'
  ).length;

  return {
    total_transactions: transactions.length,
    total_credited: totalCredited.toFixed(2),
    total_debited: totalDebited.toFixed(2),
    customer_transactions: customerTxns,
    partner_transactions: partnerTxns,
    transactions,
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface LeadTransactionsViewProps {
  leadId: string;
  leadNumber?: string;
}

const LeadTransactionsView: React.FC<LeadTransactionsViewProps> = ({ 
  leadId, 
  leadNumber 
}) => {
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [filterWallet, setFilterWallet] = useState<'all' | 'customer' | 'partner'>('all');

  // Fetch transactions
  const { data, isLoading, error } = useQuery({
    queryKey: ['lead-transactions', leadId],
    queryFn: () => fetchLeadTransactions(leadId),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Apply filters
  const filteredTransactions = data?.transactions.filter((txn) => {
    if (filterType !== 'all' && txn.transaction_type !== filterType) return false;
    if (filterWallet !== 'all' && txn.wallet_owner !== filterWallet) return false;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">Failed to load transactions</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Lead Transactions {leadNumber && `- ${leadNumber}`}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              All financial transactions for this lead
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{data.total_transactions}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
        <SummaryCard
          label="Total Credited"
          value={`₹${parseFloat(data.total_credited).toLocaleString('en-IN')}`}
          icon="📥"
          color="green"
        />
        <SummaryCard
          label="Total Debited"
          value={`₹${parseFloat(data.total_debited).toLocaleString('en-IN')}`}
          icon="📤"
          color="red"
        />
        <SummaryCard
          label="Customer Transactions"
          value={data.customer_transactions.toString()}
          icon="👤"
          color="blue"
        />
        <SummaryCard
          label="Partner Transactions"
          value={data.partner_transactions.toString()}
          icon="🏢"
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          
          {/* Transaction Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="credit">Credit Only</option>
            <option value="debit">Debit Only</option>
          </select>

          {/* Wallet Owner Filter */}
          <select
            value={filterWallet}
            onChange={(e) => setFilterWallet(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Wallets</option>
            <option value="customer">Customer Wallet</option>
            <option value="partner">Partner Wallet</option>
          </select>

          {/* Clear Filters */}
          {(filterType !== 'all' || filterWallet !== 'all') && (
            <button
              onClick={() => {
                setFilterType('all');
                setFilterWallet('all');
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Clear Filters
            </button>
          )}

          {/* Results Count */}
          <span className="ml-auto text-sm text-gray-500">
            Showing {filteredTransactions.length} of {data.total_transactions} transactions
          </span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="p-6">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No transactions found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filterType !== 'all' || filterWallet !== 'all' 
                ? 'Try changing the filters' 
                : 'Transactions will appear here once created'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((txn) => (
              <TransactionCard key={txn.id} transaction={txn} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface SummaryCardProps {
  label: string;
  value: string;
  icon: string;
  color: 'green' | 'red' | 'blue' | 'purple';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, color }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
};

interface TransactionCardProps {
  transaction: LeadTransaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const isCredit = transaction.transaction_type === 'credit';
  
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  const walletColors = {
    customer: 'bg-blue-100 text-blue-800',
    partner: 'bg-purple-100 text-purple-800',
    flipcash: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Status Badges */}
          <div className="flex items-center gap-2 mb-2">
            {/* Transaction Type */}
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              isCredit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isCredit ? '↓ Credit' : '↑ Debit'}
            </span>
            
            {/* Wallet Owner */}
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              walletColors[transaction.wallet_owner]
            }`}>
              {transaction.wallet_owner === 'customer' ? '👤 Customer' : 
               transaction.wallet_owner === 'partner' ? '🏢 Partner' : '🏦 FlipCash'}
            </span>
            
            {/* Status */}
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              statusColors[transaction.status]
            }`}>
              {transaction.status}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm font-medium text-gray-900 mb-1">
            {transaction.description}
          </p>

          {/* Category */}
          <p className="text-xs text-gray-500">
            Category: {transaction.category} • ID: {transaction.transaction_id}
          </p>

          {/* Balance Change */}
          <div className="mt-2 text-xs text-gray-600">
            <span>Balance: </span>
            <span className="font-medium">₹{parseFloat(transaction.balance_before).toLocaleString('en-IN')}</span>
            <span className="mx-1">→</span>
            <span className="font-medium">₹{parseFloat(transaction.balance_after).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Amount and Date */}
        <div className="text-right ml-4">
          <p className={`text-xl font-bold ${
            isCredit ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCredit ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(transaction.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(transaction.created_at).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Metadata (if exists) */}
      {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2 font-medium">Additional Details:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(transaction.metadata).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-gray-500">{key}:</span>{' '}
                <span className="text-gray-700 font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadTransactionsView;