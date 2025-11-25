// src/pages/partner/PartnerPaymentHistoryPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, ChevronDown, Plus, ExternalLink } from 'lucide-react';
import { usePayments } from '../../hooks/useFinance';
import { PaymentHistoryList } from '../../components/payment/PaymentComponents';
import { 
  Card, 
  Button,
  AmountDisplay,
  StatusBadge
} from '../../components/shared';
import type { CashfreePayment, PaymentStatus } from '../../api/types/finance.types';

const PartnerPaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: payments, loading, pagination, filters, setFilters, refetch } = usePayments();

  const [selectedPayment, setSelectedPayment] = useState<CashfreePayment | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions: Array<{ value: PaymentStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Status' },
    { value: 'PAID', label: 'Paid' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  const handleStatusChange = (status: PaymentStatus | 'all') => {
    setStatusFilter(status);
    setFilters({
      ...filters,
      payment_status: status === 'all' ? undefined : status,
    });
  };

  const handlePaymentClick = (payment: CashfreePayment) => {
    setSelectedPayment(payment);
  };

  // Calculate totals
  const totalPaid = payments
    .filter(p => p.payment_status === 'PAID')
    .reduce((sum, p) => sum + parseFloat(p.order_amount), 0);

  const totalPending = payments
    .filter(p => p.payment_status === 'ACTIVE')
    .reduce((sum, p) => sum + parseFloat(p.order_amount), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/wallet')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1C1C1B]">Payment History</h1>
            <p className="text-sm text-gray-600">{pagination.count} payments</p>
          </div>
          <Button size="sm" onClick={() => navigate('/wallet/add-money')}>
            <Plus className="w-4 h-4 mr-1" />
            Add Money
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card padding="sm">
            <p className="text-xs text-gray-500 mb-1">Total Added</p>
            <AmountDisplay amount={totalPaid.toString()} type="credit" size="lg" />
            <p className="text-xs text-gray-400 mt-1">
              {payments.filter(p => p.payment_status === 'PAID').length} payments
            </p>
          </Card>
          <Card padding="sm">
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <AmountDisplay amount={totalPending.toString()} size="lg" />
            <p className="text-xs text-gray-400 mt-1">
              {payments.filter(p => p.payment_status === 'ACTIVE').length} payments
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 md:hidden"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value as PaymentStatus | 'all')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FEC925] focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="outline" size="sm" onClick={refetch}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Payment List */}
        <PaymentHistoryList
          payments={payments}
          loading={loading}
          onPaymentClick={handlePaymentClick}
        />

        {/* Load More */}
        {pagination.next && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}>
              Load More
            </Button>
          </div>
        )}

        {/* Payment Detail Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl overflow-hidden">
              {/* Header */}
              <div className={`p-6 ${
                selectedPayment.payment_status === 'PAID' ? 'bg-green-50' :
                selectedPayment.payment_status === 'FAILED' ? 'bg-red-50' :
                'bg-yellow-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <StatusBadge status={selectedPayment.payment_status} />
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <AmountDisplay amount={selectedPayment.order_amount} size="xl" />
                <p className="text-sm text-gray-600 mt-2">{selectedPayment.cf_order_id}</p>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-medium capitalize">{selectedPayment.payment_method || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium">{new Date(selectedPayment.created_at).toLocaleString()}</span>
                </div>
                {selectedPayment.paid_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Paid At</span>
                    <span className="font-medium">{new Date(selectedPayment.paid_at).toLocaleString()}</span>
                  </div>
                )}
                {selectedPayment.bank_reference && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bank Reference</span>
                    <span className="font-medium">{selectedPayment.bank_reference}</span>
                  </div>
                )}
                {selectedPayment.order_note && (
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Note</span>
                    <p className="text-sm">{selectedPayment.order_note}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t flex gap-3">
                {selectedPayment.payment_status === 'ACTIVE' && selectedPayment.payment_link && (
                  <a
                    href={selectedPayment.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                  >
                    Complete Payment
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerPaymentHistoryPage;