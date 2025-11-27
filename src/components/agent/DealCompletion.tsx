// src/components/agent/DealCompletion.tsx
// Component for completing a deal with payment and signature

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck,
  IndianRupee,
  Wallet,
  Smartphone,
  Building2,
  PenTool,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  User,
  Phone,
  // Calendar,
  Package,
  FileText,
} from 'lucide-react';

interface DealCompletionProps {
  leadNumber: string;
  deviceName: string;
  customerName: string;
  customerPhone: string;
  finalPrice: number;
  onComplete: (data: {
    payment_method: 'cash' | 'upi' | 'bank_transfer';
    signature?: string;
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const DealCompletion: React.FC<DealCompletionProps> = ({
  leadNumber,
  deviceName,
  customerName,
  customerPhone,
  finalPrice,
  onComplete,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  const [step, setStep] = useState<'summary' | 'payment' | 'signature' | 'confirm'>('summary');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer'>('upi');
  const [signature, setSignature] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (step === 'signature' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = '#1C1C1B';
        context.lineWidth = 2;
        contextRef.current = context;
      }
    }
  }, [step]);

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!contextRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!canvasRef.current || !contextRef.current) return;
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSignature(null);
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setSignature(dataUrl);
    setStep('confirm');
  };

  const handleComplete = async () => {
    await onComplete({
      payment_method: paymentMethod,
      signature: signature || undefined,
      notes: notes || undefined,
    });
  };

  const paymentMethods = [
    { key: 'cash', label: 'Cash', icon: Wallet, description: 'Pay with cash' },
    { key: 'upi', label: 'UPI', icon: Smartphone, description: 'GPay, PhonePe, Paytm' },
    { key: 'bank_transfer', label: 'Bank Transfer', icon: Building2, description: 'NEFT/IMPS' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B8A05] to-[#156d04] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <BadgeCheck size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Complete Deal</h1>
            <p className="text-white/80">#{leadNumber}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="flex justify-between">
          {['Summary', 'Payment', 'Signature', 'Confirm'].map((s, i) => {
            const stepKeys = ['summary', 'payment', 'signature', 'confirm'];
            const currentIndex = stepKeys.indexOf(step);
            const isCompleted = i < currentIndex;
            const isCurrent = stepKeys[i] === step;
            
            return (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isCompleted ? 'bg-[#1B8A05] text-white' :
                  isCurrent ? 'bg-[#FEC925] text-[#1C1C1B]' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? <Check size={16} /> : i + 1}
                </div>
                <span className={`text-xs mt-1 ${isCurrent ? 'text-[#1C1C1B] font-semibold' : 'text-gray-500'}`}>
                  {s}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Summary */}
          {step === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl p-4 shadow-sm border space-y-4">
                <h3 className="font-bold text-[#1C1C1B]">Deal Summary</h3>
                
                <div className="flex items-center gap-3 py-2 border-b">
                  <Package className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Device</p>
                    <p className="font-semibold text-[#1C1C1B]">{deviceName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2 border-b">
                  <User className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-semibold text-[#1C1C1B]">{customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2 border-b">
                  <Phone className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold text-[#1C1C1B]">{customerPhone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <FileText className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Lead Number</p>
                    <p className="font-semibold text-[#1C1C1B]">#{leadNumber}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1B8A05]/10 rounded-xl p-6 text-center">
                <p className="text-sm text-[#1B8A05] font-semibold mb-2">Final Amount</p>
                <p className="text-4xl font-bold text-[#1B8A05] flex items-center justify-center">
                  <IndianRupee size={32} />
                  {finalPrice.toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => setStep('payment')}
                className="w-full py-4 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold text-lg"
              >
                Continue to Payment
              </button>
            </motion.div>
          )}

          {/* Step 2: Payment Method */}
          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="font-bold text-[#1C1C1B]">Select Payment Method</h3>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.key;
                  
                  return (
                    <button
                      key={method.key}
                      onClick={() => setPaymentMethod(method.key)}
                      className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition ${
                        isSelected
                          ? 'border-[#1B8A05] bg-[#1B8A05]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-[#1B8A05]/20' : 'bg-gray-100'
                      }`}>
                        <Icon size={24} className={isSelected ? 'text-[#1B8A05]' : 'text-gray-500'} />
                      </div>
                      <div className="text-left flex-1">
                        <p className={`font-semibold ${isSelected ? 'text-[#1B8A05]' : 'text-[#1C1C1B]'}`}>
                          {method.label}
                        </p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-[#1B8A05] rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about the transaction..."
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none resize-none h-20"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('summary')}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('signature')}
                  className="flex-1 py-3 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Signature */}
          {step === 'signature' && (
            <motion.div
              key="signature"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <PenTool className="text-[#FEC925]" size={24} />
                <div>
                  <h3 className="font-bold text-[#1C1C1B]">Customer Signature</h3>
                  <p className="text-sm text-gray-500">Ask customer to sign below</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 touch-none cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="p-2 border-t flex justify-between items-center bg-gray-50">
                  <span className="text-xs text-gray-400">Sign in the box above</span>
                  <button
                    onClick={clearSignature}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#FF0000]"
                  >
                    <Trash2 size={14} />
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('payment')}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={saveSignature}
                  className="flex-1 py-3 bg-[#FEC925] text-[#1C1C1B] rounded-xl font-bold"
                >
                  Continue
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="py-3 px-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-500"
                >
                  Skip
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-[#1B8A05]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BadgeCheck className="text-[#1B8A05]" size={40} />
                </div>
                <h3 className="text-xl font-bold text-[#1C1C1B]">Confirm Deal Completion</h3>
                <p className="text-gray-500 mt-2">Please verify all details before completing</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Device</span>
                  <span className="font-semibold">{deviceName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-semibold">{customerName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-semibold capitalize">{paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Final Amount</span>
                  <span className="font-bold text-[#1B8A05] flex items-center">
                    <IndianRupee size={16} />
                    {finalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {signature && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-2">Customer Signature</p>
                  <img src={signature} alt="Signature" className="h-16 object-contain" />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('signature')}
                  disabled={isLoading}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 py-4 bg-[#1B8A05] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Completing...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Complete Deal
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={onCancel}
                disabled={isLoading}
                className="w-full py-2 text-gray-500 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DealCompletion;
