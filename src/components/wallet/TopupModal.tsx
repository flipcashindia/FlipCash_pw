// src/components/wallet/TopUpModal.tsx
/**
 * Top-Up Modal Component
 * Supports Card, UPI, and Manual Bank Transfer
 */

import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building2, Upload, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePaymentMethods, useBankQRCode } from '../../hooks/useWallet';
import { privateApiClient } from '../../api/client/apiClient';
import { useToast } from '../../contexts/ToastContext';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

type PaymentMethod = 'card' | 'upi' | 'bank_transfer';

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, currentBalance }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [amount, setAmount] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: paymentMethods } = usePaymentMethods();
  const { data: bankQR } = useBankQRCode();

  // Card Payment Mutation
  const cardMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await privateApiClient.post('/wallet/topup/card/', {
        amount,
        return_url: window.location.href,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to initiate payment');
    },
  });

  // UPI Payment Mutation
  const upiMutation = useMutation({
    mutationFn: async ({ amount, upiId }: { amount: string; upiId: string }) => {
      const response = await privateApiClient.post('/wallet/topup/upi/', {
        amount,
        upi_id: upiId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.upi_intent_url) {
        window.location.href = data.upi_intent_url;
      } else if (data.qr_code_url) {
        // Show QR code in UI (you can add a state for this)
        toast.success('Scan the QR code to complete payment');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to initiate UPI payment');
    },
  });

  // Screenshot Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await privateApiClient.post('/wallet/upload-screenshot/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  });

  // Manual Bank Transfer Mutation
  const manualMutation = useMutation({
    mutationFn: async (data: {
      amount: string;
      utr_number: string;
      screenshot_url: string;
      bank_name?: string;
      transaction_date?: string;
      remarks?: string;
    }) => {
      const response = await privateApiClient.post('/wallet/topup/manual/', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Top-up request submitted! We will verify and credit your wallet within 24 hours.');
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit request');
    },
  });

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setAmount('');
    setUpiId('');
    setUtrNumber('');
    setScreenshot(null);
    setScreenshotPreview('');
    setBankName('');
    setTransactionDate('');
    setRemarks('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(amount);

    // Validation
    if (!amount || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountValue < 100) {
      toast.error('Minimum top-up amount is ₹100');
      return;
    }

    try {
      if (selectedMethod === 'card') {
        cardMutation.mutate(amount);
      } else if (selectedMethod === 'upi') {
        if (!upiId) {
          toast.error('Please enter UPI ID');
          return;
        }
        if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) {
          toast.error('Please enter a valid UPI ID');
          return;
        }
        upiMutation.mutate({ amount, upiId });
      } else if (selectedMethod === 'bank_transfer') {
        if (!utrNumber || !screenshot) {
          toast.error('Please provide UTR number and screenshot');
          return;
        }

        if (utrNumber.length !== 12) {
          toast.error('UTR number must be 12 digits');
          return;
        }

        // Upload screenshot first
        const uploadResult = await uploadMutation.mutateAsync(screenshot);

        // Then submit manual top-up request
        manualMutation.mutate({
          amount,
          utr_number: utrNumber,
          screenshot_url: uploadResult.url || uploadResult.file_url,
          bank_name: bankName,
          transaction_date: transactionDate,
          remarks: remarks,
        });
      }
    } catch (error) {
      console.error('Top-up error:', error);
    }
  };

  const isLoading =
    cardMutation.isPending ||
    upiMutation.isPending ||
    uploadMutation.isPending ||
    manualMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1C1C1B]">Add Money to Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Balance */}
          <div className="bg-[#F5F5F5] rounded-lg p-4">
            <p className="text-sm text-gray-600">Current Balance</p>
            <p className="text-2xl font-bold text-[#1C1C1B]">
              ₹{currentBalance.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
              Enter Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="₹ 0"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none text-lg font-semibold"
              min="100"
              step="1"
              disabled={isLoading}
            />

            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-4 py-2 bg-white border-2 border-[#FEC925] text-[#1C1C1B] rounded-lg hover:bg-[#FEC925] transition-colors text-sm font-medium"
                  disabled={isLoading}
                >
                  ₹{quickAmount.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-[#1C1C1B] mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Card */}
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'card'
                    ? 'border-[#FEC925] bg-[#FEC925] bg-opacity-10'
                    : 'border-gray-300 hover:border-[#FEC925]'
                }`}
                disabled={isLoading}
              >
                <CreditCard
                  className={`w-8 h-8 mx-auto mb-2 ${
                    selectedMethod === 'card' ? 'text-[#1C1C1B]' : 'text-gray-600'
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    selectedMethod === 'card' ? 'text-[#1C1C1B]' : 'text-gray-600'
                  }`}
                >
                  Card
                </p>
                {paymentMethods?.card?.processing_fee && (
                  <p className="text-xs text-gray-500 mt-1">
                    +{paymentMethods.card.processing_fee}% fee
                  </p>
                )}
              </button>

              {/* UPI */}
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'upi'
                    ? 'border-[#FEC925] bg-[#FEC925] bg-opacity-10'
                    : 'border-gray-300 hover:border-[#FEC925]'
                }`}
                disabled={isLoading}
              >
                <Smartphone
                  className={`w-8 h-8 mx-auto mb-2 ${
                    selectedMethod === 'upi' ? 'text-[#1C1C1B]' : 'text-gray-600'
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    selectedMethod === 'upi' ? 'text-[#1C1C1B]' : 'text-gray-600'
                  }`}
                >
                  UPI
                </p>
                {paymentMethods?.upi?.processing_fee && (
                  <p className="text-xs text-gray-500 mt-1">
                    +{paymentMethods.upi.processing_fee}% fee
                  </p>
                )}
              </button>

              {/* Bank Transfer */}
              <button
                type="button"
                onClick={() => setSelectedMethod('bank_transfer')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'bank_transfer'
                    ? 'border-[#FEC925] bg-[#FEC925] bg-opacity-10'
                    : 'border-gray-300 hover:border-[#FEC925]'
                }`}
                disabled={isLoading}
              >
                <Building2
                  className={`w-8 h-8 mx-auto mb-2 ${
                    selectedMethod === 'bank_transfer' ? 'text-[#1C1C1B]' : 'text-gray-600'
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    selectedMethod === 'bank_transfer' ? 'text-[#1C1C1B]' : 'text-gray-600'
                  }`}
                >
                  Bank
                </p>
                <p className="text-xs text-[#1B8A05] mt-1">No fee</p>
              </button>
            </div>
          </div>

          {/* UPI ID Input */}
          {selectedMethod === 'upi' && (
            <div>
              <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
                UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Bank Transfer Details */}
          {selectedMethod === 'bank_transfer' && (
            <div className="space-y-4">
              {/* Bank QR Code */}
              {bankQR && (
                <div className="bg-[#F5F5F5] rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-[#1C1C1B]">Scan QR Code or Use Details:</h3>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <img
                      src={bankQR.qr_code_url}
                      alt="Bank QR Code"
                      className="w-48 h-48 border-4 border-white rounded-lg shadow-md"
                    />
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-semibold">{bankQR.account_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-semibold font-mono">{bankQR.account_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IFSC Code:</span>
                      <span className="font-semibold font-mono">{bankQR.ifsc_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-semibold">{bankQR.bank_name}</span>
                    </div>
                    {bankQR.upi_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">UPI ID:</span>
                        <span className="font-semibold font-mono">{bankQR.upi_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* UTR Number */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
                  UTR Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 12-digit UTR number"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none font-mono"
                  maxLength={12}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Bank Name (Optional) */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
                  Bank Name (Optional)
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., HDFC Bank"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
                  disabled={isLoading}
                />
              </div>

              {/* Transaction Date */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
                  Transaction Date (Optional)
                </label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isLoading}
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
                  Transaction Screenshot <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {screenshotPreview ? (
                    <div className="space-y-3">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshot(null);
                          setScreenshotPreview('');
                        }}
                        className="text-sm text-red-600 hover:underline"
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className={`cursor-pointer block ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload screenshot</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="hidden"
                        required
                        disabled={isLoading}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1B] mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none resize-none"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {/* Info Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Verification Process:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Your request will be verified within 24 hours</li>
                    <li>Amount will be credited after verification</li>
                    <li>You'll receive a notification once approved</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadMutation.isPending
                ? 'Uploading...'
                : manualMutation.isPending
                ? 'Submitting...'
                : cardMutation.isPending || upiMutation.isPending
                ? 'Processing...'
                : selectedMethod === 'bank_transfer'
                ? 'Submit Request'
                : 'Proceed to Pay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};