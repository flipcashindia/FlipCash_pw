// src/pages/partner/PartnerPaymentCallbackPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Wallet, RefreshCw, ArrowRight } from 'lucide-react';
import { paymentApi } from '../../api/services/finance.api';
import { Card, LoadingSpinner, Button, AmountDisplay } from '../../components/shared';

// Environment detection
const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

type PageState = 'loading' | 'success' | 'failed' | 'pending' | 'error';

// Flexible payment data type to handle various API responses
interface PaymentData {
  order_id?: string;
  cf_order_id?: string;
  amount?: string;
  order_amount?: string;
  status?: string;
  order_status?: string;
  payment_status?: string;
  payment_details?: Array<{
    bank_reference?: string;
    payment_time?: string;
  }>;
  [key: string]: any; // Allow any other fields
}

const PartnerPaymentCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [pageState, setPageState] = useState<PageState>('loading');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get order ID from URL - Cashfree can use different param names
  const orderId = searchParams.get('order_id') 
    || searchParams.get('cf_order_id')
    || searchParams.get('orderId');

  const verifyPayment = async () => {
    if (!orderId) {
      setError('Invalid payment reference - no order ID found in URL');
      setPageState('error');
      return;
    }

    if (IS_LOCALHOST) {
      console.log('🔍 Verifying payment for order:', orderId);
    }

    try {
      const result = await paymentApi.verifyPayment(orderId);
      console.log('payment success result : ', result)
      if (IS_LOCALHOST) {
        console.log('📋 Verify Payment API Response:', result);
        console.log('📋 Response keys:', Object.keys(result || {}));
      }

      if (!result) {
        throw new Error('Empty response from payment verification');
      }
      console.log('payment success result : ', result)
      setPaymentData(result);

      // Get status from various possible field names
      const status = (
        result.status || 
        result.order_status || 
        result.payment_status ||
        result.cf_order_status ||
        ''
      ).toUpperCase();

      if (IS_LOCALHOST) {
        console.log('📋 Detected status:', status);
      }

      // Determine page state based on status
      if (['PAID', 'SUCCESS', 'COMPLETED', 'CAPTURED'].includes(status)) {
        setPageState('success');
      } else if (['FAILED', 'CANCELLED', 'USER_DROPPED', 'EXPIRED', 'VOID'].includes(status)) {
        setPageState('failed');
      } else if (['ACTIVE', 'PENDING', 'PROCESSING', 'INITIATED'].includes(status)) {
        setPageState('pending');
        // Auto-retry for pending payments
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000);
        }
      } else {
        // Unknown status - show as pending
        if (IS_LOCALHOST) {
          console.warn('⚠️ Unknown payment status:', status);
        }
        setPageState('pending');
      }
    } catch (err: any) {
      if (IS_LOCALHOST) {
        console.error('❌ Payment verification error:', err);
        console.error('❌ Error response:', err.response?.data);
      }
      setError(err.message || err.response?.data?.detail || 'Failed to verify payment');
      setPageState('error');
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [orderId, retryCount]);

  const handleRetry = () => {
    setPageState('loading');
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Helper to get amount from various field names
  const getAmount = (): string => {
    return paymentData?.amount 
      || paymentData?.order_amount 
      || paymentData?.payment_amount 
      || '0';
  };

  // Helper to get order ID for display
  const getOrderId = (): string => {
    return paymentData?.order_id 
      || paymentData?.cf_order_id 
      || orderId 
      || 'N/A';
  };

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return (
          <Card>
            <div className="py-16 text-center">
              <LoadingSpinner size="lg" text="Verifying payment..." />
              <p className="text-sm text-gray-500 mt-4">
                Please wait while we confirm your payment status.
              </p>
            </div>
          </Card>
        );

      case 'success':
        return (
          <div className="space-y-4">
            <Card className="bg-green-50 border-green-200">
              <div className="py-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h1>
                <p className="text-green-700 mb-6">
                  Your wallet has been topped up successfully.
                </p>
                
                <div className="mb-6">
                  <AmountDisplay amount={getAmount()} size="xl" type="credit" showSign />
                </div>

                <div className="bg-white rounded-lg p-4 mb-6 max-w-sm mx-auto">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order ID</span>
                      <span className="font-medium text-xs">{getOrderId()}</span>
                    </div>
                    {paymentData?.payment_details?.[0]?.bank_reference && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bank Reference</span>
                        <span className="font-medium">{paymentData.payment_details[0].bank_reference}</span>
                      </div>
                    )}
                    {paymentData?.payment_details?.[0]?.payment_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time</span>
                        <span className="font-medium">
                          {new Date(paymentData.payment_details[0].payment_time).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => navigate('/partner/wallet/add-money')}>
                Add More
              </Button>
              <Button fullWidth onClick={() => navigate('/partner/wallet')}>
                <Wallet className="w-4 h-4 mr-2" />
                Go to Wallet
              </Button>
            </div>

            {/* Tip Card */}
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-800">Ready to claim leads!</p>
                  <p className="text-sm text-blue-700">
                    Your wallet is now funded. Start claiming leads to earn.
                  </p>
                </div>
                <Button size="sm" onClick={() => navigate('/partner/catalog')}>
                  View Leads
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'failed':
        return (
          <div className="space-y-4">
            <Card className="bg-red-50 border-red-200">
              <div className="py-8 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-red-800 mb-2">Payment Failed</h1>
                <p className="text-red-700 mb-6">
                  Your payment could not be processed. No amount has been deducted.
                </p>
                
                <div className="bg-white rounded-lg p-4 mb-6 max-w-sm mx-auto">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order ID</span>
                      <span className="font-medium text-xs">{getOrderId()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-medium">₹{parseFloat(getAmount()).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium text-red-600">
                        {paymentData?.status || paymentData?.order_status || 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => navigate('/partner/wallet')}>
                Go to Wallet
              </Button>
              <Button fullWidth onClick={() => navigate('/partner/wallet/add-money')}>
                Try Again
              </Button>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="space-y-4">
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="py-8 text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-yellow-600" />
                </div>
                <h1 className="text-2xl font-bold text-yellow-800 mb-2">Payment Pending</h1>
                <p className="text-yellow-700 mb-6">
                  Your payment is being processed. This may take a few moments.
                </p>
                
                <div className="bg-white rounded-lg p-4 mb-6 max-w-sm mx-auto">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order ID</span>
                      <span className="font-medium text-xs">{getOrderId()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-medium">₹{parseFloat(getAmount()).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {retryCount < 3 && (
                  <div className="flex items-center justify-center gap-2 text-sm text-yellow-700">
                    <LoadingSpinner size="sm" />
                    Auto-checking status... ({retryCount + 1}/3)
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => navigate('/partner/wallet')}>
                Go to Wallet
              </Button>
              <Button fullWidth onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Status
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <div className="py-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-gray-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Something Went Wrong</h1>
                <p className="text-gray-600 mb-6">
                  {error || 'We could not verify your payment status.'}
                </p>

                {/* Debug info - only on localhost */}
                {IS_LOCALHOST && (
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-left text-xs font-mono mb-4 max-w-sm mx-auto">
                    <p>Order ID: {orderId || 'none'}</p>
                    <p>Error: {error}</p>
                    <p>URL: {window.location.href}</p>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => navigate('/partner/wallet')}>
                Go to Wallet
              </Button>
              <Button fullWidth onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default PartnerPaymentCallbackPage;