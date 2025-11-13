// src/pages/partner/PartnerWalletPage.tsx
import React from 'react';
import { usePartnerStore } from '../../stores/usePartnerStore';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { financeService } from '../../api/services/financeService'; 

export const PartnerWalletPage: React.FC = () => {
  const { partner, isLoading: isPartnerLoading } = usePartnerStore();
  const { isLoading: isAuthLoading } = useAuthStore();

  // Fetch transaction history
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['partnerTransactions'],
    queryFn: () => financeService.getPartnerTransactions({ limit: 20 }), // [cite: 12]
    enabled: !!partner,
  });

  const isLoading = isPartnerLoading || isAuthLoading;
  
  const wallet = partner?.wallet; // [cite: 1.1]

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-yellow" /></div>;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-brand-black mb-6 pb-4 border-b">My Wallet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-brand-green to-green-700 text-white p-6 rounded-lg shadow-lg">
            <p className="text-sm opacity-80">Current Balance</p>
            <p className="text-4xl font-bold">₹{wallet?.balance || '0.00'}</p>
          </div>
          <div className="bg-brand-gray-light p-6 rounded-lg">
           <p className="text-sm text-gray-600">Status</p>
           <p className="text-2xl font-bold text-brand-black capitalize">{wallet?.status || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      {/* Transaction History */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-brand-black mb-4">Transaction History</h3>
        {isLoadingTransactions ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions?.results.length === 0 && (
              <p className="text-gray-500 text-center py-10">No transactions found.</p>
            )}
            {transactions?.results.map(tx => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-brand-gray-light/50 rounded-lg">
                <div>
                  <p className="font-semibold capitalize">{tx.category}: {tx.description}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                </div>
                <p className={`text-lg font-bold ${tx.transaction_type === 'credit' ? 'text-brand-green' : 'text-brand-red'}`}>
                  {tx.transaction_type === 'credit' ? '+' : '-'} ₹{tx.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      Wallet page
    </div>
  );
};