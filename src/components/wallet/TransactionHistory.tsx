// import React from "react";
// import { ArrowUpCircle, ArrowDownCircle, ChevronLeft } from "lucide-react";
// import { type Transaction } from "../../types/wallet.types";
// import { formatCurrency, formatDate } from "../../utils/formatters";

// interface TransactionHistoryProps {
//   onBack: () => void;
//   transactions: Transaction[];
// }

// const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onBack, transactions }) => {
//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Transaction History</h1>
//         <button onClick={onBack} className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800">
//           <ChevronLeft size={16} />
//           <span>Back to Wallet</span>
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-md border border-gray-100 divide-y divide-gray-200">
//         {transactions.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">No transactions found</div>
//         ) : (
//           transactions.map((tx) => {
//             const isCredit = tx.type === "credit";
//             const isPending = tx.status === "pending";
//             return (
//               <div key={tx.id} className="p-4 flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   {isCredit ? (
//                     <ArrowUpCircle size={36} className="text-green-500 flex-shrink-0" />
//                   ) : (
//                     <ArrowDownCircle size={36} className="text-red-500 flex-shrink-0" />
//                   )}
//                   <div>
//                     <p className="font-semibold text-gray-900">{tx.description}</p>
//                     <p className="text-sm text-gray-500">{formatDate(tx.created_at)}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className={`font-semibold text-lg ${isCredit ? "text-green-600" : "text-gray-900"}`}>
//                     {isCredit ? "+" : ""}{formatCurrency(tx.amount)}
//                   </p>
//                   <p className={`text-sm font-medium ${isPending ? "text-yellow-600" : "text-green-600"}`}>
//                     {tx.status}
//                   </p>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default TransactionHistory;











// src/components/wallet/TransactionHistory.tsx
/**
 * Transaction History Component
 * Shows list of all wallet transactions with filters
 */

import React, { useState } from 'react';
import { useTransactions } from '../../hooks/useWallet'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { TransactionListParams } from '../../api/services/walletServices';

export const TransactionHistory: React.FC = () => {
  const [filters, setFilters] = useState<TransactionListParams>({
    page: 1,
    page_size: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useTransactions(filters);

  const transactions = data?.results || [];
  const totalPages = data?.count ? Math.ceil(data.count / (filters.page_size || 10)) : 1;

  const categoryLabels: Record<string, string> = {
    payment: 'Payment',
    payout: 'Payout',
    refund: 'Refund',
    fee: 'Fee',
    commission: 'Commission',
    topup: 'Top-up',
    penalty: 'Penalty',
    bonus: 'Bonus',
    adjustment: 'Adjustment',
    amount_blocked: 'Amount Blocked',
    amount_unblocked: 'Amount Unblocked',
    claim_fee: 'Claim Fee',
    purchase_payment: 'Purchase Payment',
  };

  const statusColors: Record<string, string> = {
    completed: 'bg-[#1B8A05] text-white',
    pending: 'bg-[#FEC925] text-[#1C1C1B]',
    processing: 'bg-blue-500 text-white',
    failed: 'bg-[#FF0000] text-white',
    reversed: 'bg-gray-500 text-white',
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load transactions</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1C1C1B]">Transaction History</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-[#F5F5F5] rounded-lg">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
                Type
              </label>
              <select
                value={filters.transaction_type || ''}
                onChange={(e) =>
                  setFilters({ ...filters, transaction_type: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
              >
                <option value="">All</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
              >
                <option value="">All</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
              >
                <option value="">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="reversed">Reversed</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.from_date || ''}
                onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.to_date || ''}
                onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
              />
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ page: 1, page_size: 10 })}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-gray-200">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No transactions found</p>
          </div>
        ) : (
          transactions.map((txn) => (
            <div
              key={txn.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                {/* Left Side - Icon, Category, Description */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      txn.transaction_type === 'credit'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {txn.transaction_type === 'credit' ? (
                      <ArrowDownLeft className="w-6 h-6 text-[#1B8A05]" />
                    ) : (
                      <ArrowUpRight className="w-6 h-6 text-[#FF0000]" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[#1C1C1B]">
                        {categoryLabels[txn.category] || txn.category}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          statusColors[txn.status]
                        }`}
                      >
                        {txn.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {txn.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(txn.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>

                {/* Right Side - Amount */}
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      txn.transaction_type === 'credit'
                        ? 'text-[#1B8A05]'
                        : 'text-[#FF0000]'
                    }`}
                  >
                    {txn.transaction_type === 'credit' ? '+' : '-'}₹
                    {parseFloat(txn.amount).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Balance: ₹{parseFloat(txn.balance_after).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {filters.page || 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setFilters({ ...filters, page: (filters.page || 1) - 1 })
              }
              disabled={(filters.page || 1) === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setFilters({ ...filters, page: (filters.page || 1) + 1 })
              }
              disabled={(filters.page || 1) === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};