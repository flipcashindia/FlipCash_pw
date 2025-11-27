// src/pages/partner/PartnerAddMoneyPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, AlertCircle, Shield, Loader2 } from 'lucide-react';
import { useWallet, usePayments } from '../../hooks/useFinance';
import { AddMoneyForm } from '../../components/payment/PaymentComponents';
import { 
  Card, 
  LoadingSpinner, 
  ErrorMessage, 
  Button,
  AmountDisplay 
} from '../../components/shared';
import type { CashfreePayment } from '../../api/types/finance.types';

// Declare Cashfree global type
declare global {
  interface Window {
    Cashfree?: any;
  }
}

type PageState = 'form' | 'processing' | 'redirect' | 'error';

// Environment detection for debug logging ONLY (not for SDK mode)
const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const PartnerAddMoneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: walletData, loading: walletLoading, error: walletError, refetch: refetchWallet } = useWallet();
  const { createPayment } = usePayments();

  const [pageState, setPageState] = useState<PageState>('form');
  const [createdPayment, setCreatedPayment] = useState<CashfreePayment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);

  // Load Cashfree SDK on component mount
  useEffect(() => {
    const loadCashfreeSDK = async () => {
      if (window.Cashfree) {
        setCashfreeLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      script.onload = () => {
        if (IS_LOCALHOST) console.log('✅ Cashfree SDK loaded');
        setCashfreeLoaded(true);
      };
      script.onerror = () => {
        if (IS_LOCALHOST) console.error('❌ Failed to load Cashfree SDK');
        setError('Failed to load payment gateway. Please refresh the page.');
      };
      document.body.appendChild(script);
    };

    loadCashfreeSDK();
  }, []);

  // ================================================================
  // UPDATED: Accept cashfreeMode as parameter from API response
  // ================================================================
  const openCashfreeCheckout = async (paymentSessionId: string, cashfreeMode: string) => {
    try {
      if (!window.Cashfree) {
        throw new Error('Cashfree SDK not loaded');
      }

      if (IS_LOCALHOST) {
        console.log('🚀 Opening Cashfree checkout...');
        console.log('📋 Mode:', cashfreeMode);
        console.log('📋 Session ID:', paymentSessionId);
      }

      // Initialize Cashfree with mode from backend
      const cashfree = window.Cashfree({
        mode: cashfreeMode,  // ✅ Use mode from API, not hardcoded
      });

      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: '_self',
      };

      if (IS_LOCALHOST) console.log('📋 Checkout options:', checkoutOptions);

      await cashfree.checkout(checkoutOptions);
      
      if (IS_LOCALHOST) console.log('✅ Checkout opened');
      
    } catch (err: any) {
      if (IS_LOCALHOST) console.error('❌ Cashfree checkout error:', err);
      throw new Error(`Payment gateway error: ${err.message || 'Unknown error'}`);
    }
  };

  const handleSubmit = async (amount: string) => {
    if (IS_LOCALHOST) console.log('📤 Creating payment for amount:', amount);
    
    setLoading(true);
    setError(null);
    setPageState('processing');

    try {
      if (!createPayment) {
        throw new Error('Payment service not available');
      }
      
      const payment = await createPayment(amount, 'wallet_topup');
      if (IS_LOCALHOST) console.log('✅ Payment created:', payment);
      
      if (!payment) {
        throw new Error('No payment response received');
      }
      
      setCreatedPayment(payment);

      const paymentSessionId = payment.payment_session_id;
      
      // ================================================================
      // CRITICAL: Get Cashfree mode from backend response
      // ================================================================
      const cashfreeMode = payment.cashfree_mode || 'sandbox';
      
      if (IS_LOCALHOST) {
        console.log('📋 Payment Session ID:', paymentSessionId);
        console.log('📋 Cashfree Mode from Backend:', cashfreeMode);
      }
      
      // If we have a direct payment link, use it
      if (payment.payment_link && payment.payment_link.startsWith('http')) {
        if (IS_LOCALHOST) console.log('🔗 Using direct payment link:', payment.payment_link);
        setPageState('redirect');
        setTimeout(() => {
          window.location.href = payment.payment_link;
        }, 1500);
        return;
      }
      
      // Otherwise, use Cashfree SDK with payment_session_id
      if (paymentSessionId) {
        if (IS_LOCALHOST) console.log('🔗 Using Cashfree SDK with session:', paymentSessionId);
        await openCashfreeCheckout(paymentSessionId, cashfreeMode);
      } else {
        throw new Error('No payment link or session ID received');
      }
      
    } catch (err: any) {
      if (IS_LOCALHOST) console.error('❌ Payment error:', err);
      setError(err.message || 'Failed to create payment order');
      setPageState('error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (pageState === 'form') {
      navigate('/partner/wallet');
    } else {
      setPageState('form');
      setCreatedPayment(null);
      setError(null);
    }
  };

  const handleManualRedirect = () => {
    if (!createdPayment) return;
    
    const paymentSessionId = createdPayment.payment_session_id;
    const paymentLink = createdPayment.payment_link;
    const cashfreeMode = createdPayment.cashfree_mode || 'sandbox';
    
    if (paymentLink && paymentLink.startsWith('http')) {
      window.location.href = paymentLink;
    } else if (paymentSessionId) {
      openCashfreeCheckout(paymentSessionId, cashfreeMode);
    } else {
      setError('No payment link available');
    }
  };

  // Safe wallet balance
  const walletBalance = walletData?.wallet?.balance || '0.00';

  if (walletLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (walletError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <ErrorMessage message={walletError} onRetry={refetchWallet} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleGoBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1C1C1B]">Add Money</h1>
            <p className="text-sm text-gray-600">Top-up your wallet balance</p>
          </div>
        </div>

        {/* SDK Loading Warning */}
        {!cashfreeLoaded && pageState === 'form' && (
          <Card className="mb-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
              <p className="text-sm text-yellow-800">Loading payment gateway...</p>
            </div>
          </Card>
        )}

        {/* Current Balance */}
        {pageState === 'form' && (
          <Card className="mb-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <AmountDisplay amount={walletBalance} size="lg" />
              </div>
              <div className="w-12 h-12 bg-[#FEC925] rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-[#1C1C1B]">₹</span>
              </div>
            </div>
          </Card>
        )}

        {/* Form State */}
        {pageState === 'form' && (
          <>
            <AddMoneyForm
              onSubmit={handleSubmit}
              loading={loading || !cashfreeLoaded}
              minAmount={100}
              maxAmount={100000}
            />

            {/* Security Note */}
            <Card className="mt-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Secure Payments</p>
                  <p className="text-sm text-blue-700 mt-1">
                    All payments are processed securely through Cashfree Payment Gateway.
                  </p>
                </div>
              </div>
            </Card>

            {/* Payment Methods Info */}
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>We accept UPI, Credit/Debit Cards, Net Banking & Wallets</p>
            </div>
          </>
        )}

        {/* Processing State */}
        {pageState === 'processing' && (
          <Card>
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#FEC925] mx-auto mb-4" />
              <p className="text-lg font-medium">Creating payment order...</p>
              <p className="text-sm text-gray-500 mt-2">
                Please wait while we prepare your payment.
              </p>
            </div>
          </Card>
        )}

        {/* Redirect State */}
        {pageState === 'redirect' && createdPayment && (
          <div className="space-y-4">
            <Card className="bg-[#FEC925]/10 border-[#FEC925]">
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-[#FEC925] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-8 h-8 text-[#1C1C1B]" />
                </div>
                <h2 className="text-xl font-bold text-[#1C1C1B] mb-2">Redirecting to Payment</h2>
                <p className="text-gray-600 mb-4">
                  You'll be redirected to the secure payment page.
                </p>
                
                <AmountDisplay amount={createdPayment.order_amount || '0'} size="xl" />
                
                <p className="text-sm text-gray-500 mt-4">
                  Order ID: {createdPayment.cf_order_id || createdPayment.id || 'N/A'}
                </p>
              </div>
            </Card>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Not redirected automatically?</p>
              <Button onClick={handleManualRedirect}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Payment Page
              </Button>
            </div>

            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Important</p>
                  <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside space-y-1">
                    <li>Do not close this window until payment is complete</li>
                    <li>After successful payment, you'll be redirected back</li>
                    <li>Your wallet will be updated within 30 seconds</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Error State */}
        {pageState === 'error' && (
          <div className="space-y-4">
            <Card className="bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Payment Failed</p>
                  <p className="text-sm text-red-700 mt-1">
                    {error || 'Something went wrong. Please try again.'}
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={handleGoBack}>
                Go Back
              </Button>
              <Button fullWidth onClick={() => setPageState('form')}>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerAddMoneyPage;
