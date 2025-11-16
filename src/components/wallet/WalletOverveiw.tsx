// src/components/wallet/WalletOverview.tsx
/**
 * Wallet Overview Component
 * Shows balance, stats, and quick top-up options
 */

import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet'
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, TrendingUp } from 'lucide-react';
import { TopUpModal } from './TopupModal'
import { TransactionHistory } from './TransactionHistory';

export const WalletOverview: React.FC = () => {
  const { wallet, balance, stats, isLoading, error, refetch } = useWallet();
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEC925]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load wallet. Please try again.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-red-600 underline text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const balanceAmount = parseFloat(balance?.balance || '0');
  const availableAmount = parseFloat(balance?.available_balance || '0');
  const blockedAmount = balanceAmount - availableAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1C1C1B]">My Wallet</h1>
        <button
          onClick={() => refetch()}
          className="text-sm text-gray-600 hover:text-[#1C1C1B]"
        >
          Refresh
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-[#FEC925] to-[#e6b31f] rounded-xl p-6 text-[#1C1C1B] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8" />
            <span className="text-sm font-medium opacity-90">Total Balance</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">₹{balanceAmount.toLocaleString('en-IN')}</p>
            <p className="text-sm opacity-80">{wallet?.currency || 'INR'}</p>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white border-2 border-[#1B8A05] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <ArrowUpRight className="w-6 h-6 text-[#1B8A05]" />
            <span className="text-sm font-medium text-gray-600">Available</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[#1B8A05]">
              ₹{availableAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-500">Ready to use</p>
          </div>
        </div>

        {/* Blocked Balance */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-6 h-6 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Blocked</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-700">
              ₹{blockedAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-500">For claimed leads</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Credits"
            value={`₹${parseFloat(stats.total_credits).toLocaleString('en-IN')}`}
            icon={<ArrowDownLeft className="w-5 h-5 text-[#1B8A05]" />}
            color="green"
          />
          <StatCard
            label="Total Debits"
            value={`₹${parseFloat(stats.total_debits).toLocaleString('en-IN')}`}
            icon={<ArrowUpRight className="w-5 h-5 text-[#FF0000]" />}
            color="red"
          />
          <StatCard
            label="This Month"
            value={`₹${parseFloat(stats.this_month_topups).toLocaleString('en-IN')}`}
            icon={<TrendingUp className="w-5 h-5 text-[#FEC925]" />}
            color="yellow"
          />
          <StatCard
            label="Pending"
            value={`₹${parseFloat(stats.pending_topups).toLocaleString('en-IN')}`}
            icon={<Clock className="w-5 h-5 text-gray-600" />}
            color="gray"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowTopUpModal(true)}
          className="flex-1 bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowDownLeft className="w-5 h-5" />
          Add Money
        </button>
        <button
          className="flex-1 bg-white border-2 border-[#1C1C1B] hover:bg-gray-50 text-[#1C1C1B] font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Withdraw
        </button>
      </div>

      {/* Transaction History */}
      <TransactionHistory />

      {/* Top-Up Modal */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        currentBalance={balanceAmount}
      />
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'yellow' | 'gray';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  const borderColors = {
    green: 'border-[#1B8A05]',
    red: 'border-[#FF0000]',
    yellow: 'border-[#FEC925]',
    gray: 'border-gray-300',
  };

  return (
    <div className={`bg-white border ${borderColors[color]} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <p className="text-lg font-bold text-[#1C1C1B]">{value}</p>
    </div>
  );
};