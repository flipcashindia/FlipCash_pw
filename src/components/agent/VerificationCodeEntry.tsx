// src/components/agent/VerificationCodeEntry.tsx
// Component for entering verification code from customer

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface VerificationCodeEntryProps {
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
  customerName?: string;
}

const VerificationCodeEntry: React.FC<VerificationCodeEntryProps> = ({
  onVerify,
  onCancel,
  isLoading = false,
  error = null,
  customerName,
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
      setCode(newCode);
      
      // Focus last filled input or submit if complete
      const lastIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      
      if (pastedData.length === 6) {
        handleSubmit(pastedData);
      }
    }
  };

  const handleSubmit = async (fullCode?: string) => {
    const codeToSubmit = fullCode || code.join('');
    if (codeToSubmit.length === 6) {
      await onVerify(codeToSubmit);
    }
  };

  const handleClear = () => {
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const fullCode = code.join('');
  const isComplete = fullCode.length === 6;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-[#FEC925]/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <KeyRound className="text-[#FEC925]" size={40} />
        </motion.div>
        <h2 className="text-2xl font-bold text-[#1C1C1B]">Enter Verification Code</h2>
        <p className="text-gray-600 mt-2">
          {customerName 
            ? `Ask ${customerName} for their 6-digit code`
            : 'Ask the customer for their 6-digit verification code'}
        </p>
      </div>

      {/* Code Input */}
      <div className="flex justify-center gap-2 mb-6">
        {code.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all
              ${digit ? 'border-[#FEC925] bg-[#FEC925]/10' : 'border-gray-200 bg-white'}
              ${error ? 'border-[#FF0000] bg-red-50' : ''}
              focus:border-[#FEC925] focus:outline-none focus:ring-2 focus:ring-[#FEC925]/20
            `}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-[#FF0000] mb-4"
        >
          <XCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleSubmit()}
          disabled={!isComplete || isLoading}
          className="w-full px-4 py-3 bg-[#1B8A05] text-white rounded-xl font-bold 
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-[#156d04] transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Verify Code
            </>
          )}
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold
              text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-2
              disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Clear
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold
              text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-600 text-center">
          The customer can find their verification code in the FlipCash app under "My Leads" → "View Code"
        </p>
      </div>
    </div>
  );
};

export default VerificationCodeEntry;
