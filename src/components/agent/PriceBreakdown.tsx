// src/components/agent/PriceBreakdown.tsx
// Component for displaying and adjusting price after inspection

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee,
  TrendingDown,
  Plus,
  // Minus,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface PriceDeduction {
  id: string;
  reason: string;
  amount: number;
  category: string;
}

interface PriceBreakdownProps {
  originalPrice: number;
  deductions: PriceDeduction[];
  onDeductionsChange?: (deductions: PriceDeduction[]) => void;
  finalPrice: number;
  onFinalPriceChange?: (price: number) => void;
  isEditable?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

// Common deduction reasons
const DEDUCTION_PRESETS = [
  { reason: 'Screen damage', category: 'physical', amounts: [500, 1000, 2000, 3000] },
  { reason: 'Body scratches', category: 'physical', amounts: [200, 500, 1000] },
  { reason: 'Dents/Bends', category: 'physical', amounts: [500, 1000, 2000] },
  { reason: 'Battery health below 80%', category: 'functional', amounts: [500, 1000, 1500] },
  { reason: 'Camera not working', category: 'functional', amounts: [1000, 2000, 3000] },
  { reason: 'Speaker issue', category: 'functional', amounts: [500, 1000] },
  { reason: 'Microphone issue', category: 'functional', amounts: [500, 1000] },
  { reason: 'Touch issues', category: 'functional', amounts: [1000, 2000, 3000] },
  { reason: 'Button not working', category: 'functional', amounts: [300, 500, 1000] },
  { reason: 'Charging port issue', category: 'functional', amounts: [500, 1000] },
  { reason: 'Fingerprint not working', category: 'functional', amounts: [500, 1000, 1500] },
  { reason: 'WiFi/Bluetooth issue', category: 'functional', amounts: [500, 1000] },
  { reason: 'No original box', category: 'accessories', amounts: [200, 500] },
  { reason: 'No charger', category: 'accessories', amounts: [200, 500] },
  { reason: 'No bill/invoice', category: 'accessories', amounts: [200, 500] },
  { reason: 'Lower storage than claimed', category: 'mismatch', amounts: [1000, 2000, 3000] },
];

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  originalPrice,
  deductions,
  onDeductionsChange,
  finalPrice,
  onFinalPriceChange,
  isEditable = true,
  minPrice = 0,
  maxPrice,
}) => {
  const [showAddDeduction, setShowAddDeduction] = useState(false);
  const [editingFinalPrice, setEditingFinalPrice] = useState(false);
  const [tempFinalPrice, setTempFinalPrice] = useState(finalPrice);
  const [customDeduction, setCustomDeduction] = useState({
    reason: '',
    amount: 0,
    category: 'other',
  });

  useEffect(() => {
    setTempFinalPrice(finalPrice);
  }, [finalPrice]);

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const calculatedPrice = originalPrice - totalDeductions;
  const priceDifference = finalPrice - calculatedPrice;

  const addDeduction = (reason: string, amount: number, category: string) => {
    if (!onDeductionsChange) return;
    
    const newDeduction: PriceDeduction = {
      id: `d-${Date.now()}`,
      reason,
      amount,
      category,
    };
    onDeductionsChange([...deductions, newDeduction]);
    setShowAddDeduction(false);
  };

  const removeDeduction = (id: string) => {
    if (!onDeductionsChange) return;
    onDeductionsChange(deductions.filter(d => d.id !== id));
  };

  const handleCustomDeductionAdd = () => {
    if (customDeduction.reason && customDeduction.amount > 0) {
      addDeduction(
        customDeduction.reason,
        customDeduction.amount,
        customDeduction.category
      );
      setCustomDeduction({ reason: '', amount: 0, category: 'other' });
    }
  };

  const handleFinalPriceConfirm = () => {
    if (onFinalPriceChange) {
      let price = tempFinalPrice;
      if (minPrice && price < minPrice) price = minPrice;
      if (maxPrice && price > maxPrice) price = maxPrice;
      onFinalPriceChange(price);
    }
    setEditingFinalPrice(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      physical: 'bg-orange-100 text-orange-700',
      functional: 'bg-red-100 text-red-700',
      accessories: 'bg-blue-100 text-blue-700',
      mismatch: 'bg-purple-100 text-purple-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1C1C1B] to-[#2d2d2c] p-4 text-white">
        <h3 className="font-bold text-lg">Price Breakdown</h3>
        <p className="text-white/70 text-sm">Review and adjust the final offer</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Original Price */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-gray-600">Original Estimate</span>
          <span className="text-lg font-bold text-[#1C1C1B] flex items-center gap-1">
            <IndianRupee size={18} />
            {originalPrice.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Deductions */}
        {deductions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <TrendingDown size={16} className="text-[#FF0000]" />
              Deductions
            </div>
            <AnimatePresence>
              {deductions.map((deduction) => (
                <motion.div
                  key={deduction.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getCategoryColor(deduction.category)}`}>
                      {deduction.category}
                    </span>
                    <span className="text-sm text-gray-700">{deduction.reason}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#FF0000] font-semibold">
                      -₹{deduction.amount.toLocaleString('en-IN')}
                    </span>
                    {isEditable && (
                      <button
                        onClick={() => removeDeduction(deduction.id)}
                        className="p-1 text-gray-400 hover:text-[#FF0000] transition"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add Deduction Button */}
        {isEditable && !showAddDeduction && (
          <button
            onClick={() => setShowAddDeduction(true)}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 
              hover:border-[#FEC925] hover:text-[#FEC925] transition flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Deduction
          </button>
        )}

        {/* Add Deduction Form */}
        <AnimatePresence>
          {showAddDeduction && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-2 border-[#FEC925] rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1C1C1B]">Add Deduction</span>
                <button
                  onClick={() => setShowAddDeduction(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Preset Deductions */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {DEDUCTION_PRESETS.map((preset, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">{preset.reason}</span>
                    <div className="flex gap-1">
                      {preset.amounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => addDeduction(preset.reason, amount, preset.category)}
                          className="px-2 py-1 bg-gray-100 hover:bg-[#FEC925]/20 rounded text-xs font-semibold transition"
                        >
                          -₹{amount}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Deduction */}
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Custom Deduction</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDeduction.reason}
                    onChange={(e) => setCustomDeduction({ ...customDeduction, reason: e.target.value })}
                    placeholder="Reason"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#FEC925] focus:outline-none"
                  />
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      value={customDeduction.amount || ''}
                      onChange={(e) => setCustomDeduction({ ...customDeduction, amount: Number(e.target.value) })}
                      placeholder="Amount"
                      className="w-24 pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#FEC925] focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleCustomDeductionAdd}
                    disabled={!customDeduction.reason || customDeduction.amount <= 0}
                    className="px-3 py-2 bg-[#FEC925] text-[#1C1C1B] rounded-lg font-semibold disabled:opacity-50"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calculated Price */}
        <div className="flex items-center justify-between py-3 border-t border-gray-200">
          <span className="text-gray-600">After Deductions</span>
          <span className="text-lg font-semibold text-gray-700 flex items-center gap-1">
            <IndianRupee size={18} />
            {calculatedPrice.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Final Price */}
        <div className="bg-[#1B8A05]/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B8A05] font-semibold">Final Offer Price</p>
              {priceDifference !== 0 && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Info size={12} />
                  {priceDifference > 0 ? 'Increased' : 'Reduced'} by ₹{Math.abs(priceDifference).toLocaleString('en-IN')}
                </p>
              )}
            </div>
            
            {editingFinalPrice ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B8A05]">₹</span>
                  <input
                    type="number"
                    value={tempFinalPrice}
                    onChange={(e) => setTempFinalPrice(Number(e.target.value))}
                    className="w-32 pl-7 pr-2 py-2 border-2 border-[#1B8A05] rounded-lg text-xl font-bold text-[#1B8A05] focus:outline-none"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleFinalPriceConfirm}
                  className="p-2 bg-[#1B8A05] text-white rounded-lg"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => {
                    setTempFinalPrice(finalPrice);
                    setEditingFinalPrice(false);
                  }}
                  className="p-2 bg-gray-200 text-gray-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#1B8A05] flex items-center">
                  <IndianRupee size={22} />
                  {finalPrice.toLocaleString('en-IN')}
                </span>
                {isEditable && (
                  <button
                    onClick={() => setEditingFinalPrice(true)}
                    className="p-2 text-[#1B8A05] hover:bg-[#1B8A05]/20 rounded-lg transition"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Warning if price significantly different */}
        {Math.abs(priceDifference) > originalPrice * 0.2 && (
          <div className="flex items-start gap-2 p-3 bg-[#FEC925]/10 border border-[#FEC925] rounded-xl">
            <AlertTriangle className="text-[#FEC925] flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm">
              <p className="font-semibold text-[#b48f00]">Large price adjustment</p>
              <p className="text-gray-600">
                The final price differs significantly from calculations. Customer may question this.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceBreakdown;
