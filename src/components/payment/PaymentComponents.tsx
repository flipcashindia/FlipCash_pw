// src/components/payment/PaymentComponents.tsx

import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Smartphone,
  Building2,
  Wallet
} from 'lucide-react';
import type { CashfreePayment, PaymentMethod } from '../../api/types/finance.types';
import { Card, StatusBadge, AmountDisplay, EmptyState, LoadingSpinner, Button } from '../shared';

// =============================================================================
// ADD MONEY FORM
// =============================================================================
interface AddMoneyFormProps {
  onSubmit: (amount: string) => void;
  loading?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

export const AddMoneyForm: React.FC<AddMoneyFormProps> = ({
  onSubmit,
  loading = false,
  minAmount = 100,
  maxAmount = 100000,
}) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (numAmount < minAmount) {
      setError(`Minimum amount is ₹${minAmount}`);
      return;
    }
    if (numAmount > maxAmount) {
      setError(`Maximum amount is ₹${maxAmount.toLocaleString('en-IN')}`);
      return;
    }

    onSubmit(amount);
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-[#1C1C1B] mb-4">Add Money to Wallet</h3>

      <form onSubmit={handleSubmit}>
        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium text-gray-500">
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-4 text-2xl font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FEC925] focus:border-transparent"
              min={minAmount}
              max={maxAmount}
              step="0.01"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Min: ₹{minAmount} | Max: ₹{maxAmount.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Quick Add</p>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  amount === quickAmount.toString()
                    ? 'bg-[#FEC925] text-[#1C1C1B]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ₹{quickAmount.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" loading={loading} fullWidth size="lg">
          Proceed to Pay
        </Button>
      </form>
    </Card>
  );
};

// =============================================================================
// PAYMENT METHOD SELECTOR
// =============================================================================
interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
}) => {
  const methods: PaymentMethodOption[] = [
    {
      id: 'upi',
      name: 'UPI',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Pay using any UPI app',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa, Mastercard, RuPay',
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building2 className="w-6 h-6" />,
      description: 'All major banks supported',
    },
    {
      id: 'app',
      name: 'Wallet',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Paytm, PhonePe, etc.',
    },
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-[#1C1C1B] mb-4">Select Payment Method</h3>
      <div className="space-y-3">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors ${
              selectedMethod === method.id
                ? 'border-[#FEC925] bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              selectedMethod === method.id ? 'bg-[#FEC925]' : 'bg-gray-100'
            }`}>
              {method.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-[#1C1C1B]">{method.name}</p>
              <p className="text-sm text-gray-500">{method.description}</p>
            </div>
            {selectedMethod === method.id && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </button>
        ))}
      </div>
    </Card>
  );
};

// =============================================================================
// PAYMENT STATUS CARD
// =============================================================================
interface PaymentStatusCardProps {
  payment: CashfreePayment;
  onViewDetails?: () => void;
  onRetry?: () => void;
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  payment,
  onViewDetails,
  onRetry,
}) => {
  const getStatusConfig = () => {
    switch (payment.payment_status) {
      case 'PAID':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: 'Payment Successful',
          description: 'Your wallet has been credited',
          bgColor: 'bg-green-50',
        };
      case 'FAILED':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'Payment Failed',
          description: 'Something went wrong. Please try again.',
          bgColor: 'bg-red-50',
        };
      case 'ACTIVE':
        return {
          icon: <Clock className="w-16 h-16 text-yellow-500" />,
          title: 'Payment Pending',
          description: 'Complete your payment',
          bgColor: 'bg-yellow-50',
        };
      default:
        return {
          icon: <Clock className="w-16 h-16 text-gray-500" />,
          title: payment.payment_status,
          description: 'Payment status',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className={config.bgColor}>
      <div className="text-center py-6">
        <div className="flex justify-center mb-4">{config.icon}</div>
        <h2 className="text-xl font-bold text-[#1C1C1B] mb-2">{config.title}</h2>
        <p className="text-gray-600 mb-4">{config.description}</p>
        
        <AmountDisplay amount={payment.order_amount} size="xl" />
        
        <p className="text-sm text-gray-500 mt-4">
          Order ID: {payment.cf_order_id}
        </p>

        <div className="flex gap-3 mt-6 justify-center">
          {payment.payment_status === 'ACTIVE' && payment.payment_link && (
            <a
              href={payment.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-lg font-medium hover:bg-yellow-400 transition-colors"
            >
              Complete Payment
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {payment.payment_status === 'FAILED' && onRetry && (
            <Button onClick={onRetry}>Try Again</Button>
          )}
          {onViewDetails && (
            <Button variant="outline" onClick={onViewDetails}>
              View Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// =============================================================================
// PAYMENT HISTORY ITEM
// =============================================================================
interface PaymentHistoryItemProps {
  payment: CashfreePayment;
  onClick?: () => void;
}

export const PaymentHistoryItem: React.FC<PaymentHistoryItemProps> = ({ payment, onClick }) => {
  const getMethodIcon = (method: PaymentMethod | '') => {
    switch (method) {
      case 'upi':
        return <Smartphone className="w-5 h-5" />;
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'netbanking':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Icon */}
      <div className="w-10 h-10 bg-[#FEC925]/20 rounded-full flex items-center justify-center text-[#1C1C1B]">
        {getMethodIcon(payment.payment_method)}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-[#1C1C1B] truncate">Wallet Top-up</p>
          <StatusBadge status={payment.payment_status} size="sm" />
        </div>
        <p className="text-sm text-gray-500 truncate">
          {payment.cf_order_id}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(payment.created_at).toLocaleString()}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <AmountDisplay amount={payment.order_amount} type="credit" showSign />
        {payment.payment_method && (
          <p className="text-xs text-gray-500 mt-1 capitalize">
            via {payment.payment_method}
          </p>
        )}
      </div>

      {onClick && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </div>
  );
};

// =============================================================================
// PAYMENT HISTORY LIST
// =============================================================================
interface PaymentHistoryListProps {
  payments: CashfreePayment[];
  loading?: boolean;
  onPaymentClick?: (payment: CashfreePayment) => void;
}

export const PaymentHistoryList: React.FC<PaymentHistoryListProps> = ({
  payments,
  loading = false,
  onPaymentClick,
}) => {
  if (loading && payments.length === 0) {
    return (
      <Card>
        <div className="py-8">
          <LoadingSpinner text="Loading payments..." />
        </div>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No payments yet"
          description="Your payment history will appear here"
          icon={<CreditCard className="w-8 h-8 text-gray-400" />}
        />
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="divide-y divide-gray-100">
        {payments.map((payment) => (
          <PaymentHistoryItem
            key={payment.id}
            payment={payment}
            onClick={onPaymentClick ? () => onPaymentClick(payment) : undefined}
          />
        ))}
      </div>
    </Card>
  );
};