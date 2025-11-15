// src/components/partner/TopUpModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Upload } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { financeService } from '../../api/services/financeService';
import { toast } from 'react-hot-toast';

// --- Props Interface ---
interface TopUpModalProps {
  onClose: () => void;
}

// --- Mock Service Function ---
// You will need to add this to your `financeService.ts`
// const submitTopUpRequest = async (formData: FormData) => {
//   const { data } = await privateApiClient.post('/finance/topup-request/', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return data;
// };
// ------------------------------




export const TopUpModal: React.FC<TopUpModalProps> = ({ onClose }) => {
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => financeService.submitTopUpRequest(formData),
    onSuccess: () => {
      toast.success('Top-up request submitted! It will be reviewed shortly.');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit request. Please try again.');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr || !screenshot) {
      toast.error('Please provide both a UTR and a screenshot.');
      return;
    }

    const formData = new FormData();
    formData.append('utr', utr);
    formData.append('screenshot', screenshot);

    mutation.mutate(formData);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-xl font-semibold text-brand-black">Top Up Wallet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Step 1: Scan QR */}
          <div className="text-center">
            <label className="text-sm font-medium text-gray-700">1. Scan to Pay</label>
            <p className="text-xs text-gray-500 mb-3">Use your UPI app to scan the merchant QR code.</p>
            <div className="flex justify-center items-center bg-gray-100 p-4 rounded-lg max-w-xs mx-auto">
              {/* This is a placeholder. 
                Replace 'merchant-qr-code.png' with the actual path to your QR code image. 
              */}
              <img 
                src="/path/to/merchant-qr-code.png" 
                alt="Merchant UPI QR Code" 
                className="w-48 h-48 object-contain"
              />
              {/* Fallback Icon if image fails to load */}
              {/* <QrCode size={192} className="text-gray-400" /> */}
            </div>
          </div>

          {/* Step 2: Submit Details */}
          <div>
            <label className="text-sm font-medium text-gray-700">2. Submit Verification Details</label>
            <p className="text-xs text-gray-500 mb-3">Enter the Transaction ID (UTR) and upload a screenshot.</p>
            
            {/* UTR Input */}
            <div className="mb-4">
              <label htmlFor="utr" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID / UTR
              </label>
              <input
                type="text"
                id="utr"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter 12-digit UTR"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
            
            {/* Screenshot Upload */}
            <div>
              <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Screenshot
              </label>
              <label
                htmlFor="screenshot"
                className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                {filePreview ? (
                  <img src={filePreview} alt="Screenshot preview" className="h-full w-full object-contain rounded-lg p-1" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, or JPEG</p>
                  </div>
                )}
                <input
                  id="screenshot"
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/png, image/jpeg, image/jpg"
                  required
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Footer & Submit Button */}
          <div className="border-t pt-5">
            <button
              type="submit"
              disabled={mutation.isPending} // <-- Corrected
              className="..."
            >
              {mutation.isPending ? ( // <-- Corrected
                <Loader2 size={20} className="animate-spin" />
              ) : (
                'Submit for Verification'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
};