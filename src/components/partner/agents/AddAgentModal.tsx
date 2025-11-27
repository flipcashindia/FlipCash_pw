// src/components/partner/agents/AddAgentModal.tsx
// Modal for adding a new agent

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UserPlus,
  Loader2,
  Phone,
  User,
  Mail,
  BadgeCheck,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useCreateAgent } from '../../../hooks/useAgents';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddAgentModal: React.FC<AddAgentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    employee_code: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createAgentMutation = useCreateAgent();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Phone validation (Indian 10-digit)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!phoneDigits) {
      newErrors.phone = 'Phone number is required';
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = 'Phone number must be 10 digits';
    } else if (!/^[6-9]/.test(phoneDigits)) {
      newErrors.phone = 'Phone number must start with 6, 7, 8, or 9';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation (optional but if provided must be valid)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Format phone number (remove any non-digits and ensure 10 digits)
      const phone = formData.phone.replace(/\D/g, '');

      await createAgentMutation.mutateAsync({
        phone,
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        employee_code: formData.employee_code.trim() || undefined,
      });

      // Reset form
      setFormData({ phone: '', name: '', email: '', employee_code: '' });
      setErrors({});
      onSuccess();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to create agent' });
    }
  };

  const handleClose = () => {
    setFormData({ phone: '', name: '', email: '', employee_code: '' });
    setErrors({});
    onClose();
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits and format nicely
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digits }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FEC925] to-[#e5b520] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <UserPlus className="text-[#1C1C1B]" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1C1C1B]">Add New Agent</h3>
                  <p className="text-[#1C1C1B]/70 text-sm">Add a field agent to your team</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-[#1C1C1B]/60 hover:text-[#1C1C1B] transition"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Error Banner */}
            {errors.submit && (
              <div className="p-4 bg-[#FF0000]/10 border-2 border-[#FF0000] rounded-xl flex items-center gap-3">
                <AlertCircle className="text-[#FF0000]" size={20} />
                <p className="text-[#FF0000] font-semibold text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block font-bold text-[#1C1C1B] mb-2">
                Phone Number <span className="text-[#FF0000]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                  +91
                </span>
                <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="9876543210"
                  className={`w-full pl-14 pr-12 py-3 border-2 rounded-xl focus:outline-none transition ${
                    errors.phone
                      ? 'border-[#FF0000] focus:border-[#FF0000]'
                      : 'border-gray-200 focus:border-[#FEC925]'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[#FF0000] text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.phone}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                An OTP will be sent to this number for verification
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block font-bold text-[#1C1C1B] mb-2">
                Full Name <span className="text-[#FF0000]">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="Enter agent's full name"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                    errors.name
                      ? 'border-[#FF0000] focus:border-[#FF0000]'
                      : 'border-gray-200 focus:border-[#FEC925]'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-[#FF0000] text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block font-bold text-[#1C1C1B] mb-2">
                Email <span className="text-gray-400 text-sm font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }));
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="agent@example.com"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                    errors.email
                      ? 'border-[#FF0000] focus:border-[#FF0000]'
                      : 'border-gray-200 focus:border-[#FEC925]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[#FF0000] text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Employee ID (Optional) */}
            <div>
              <label className="block font-bold text-[#1C1C1B] mb-2">
                Employee ID <span className="text-gray-400 text-sm font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <BadgeCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.employee_code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, employee_code: e.target.value }))}
                  placeholder="e.g., EMP001"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none transition"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Internal employee ID for your reference
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <CheckCircle size={18} />
                What happens next?
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Agent will receive an SMS with login instructions</li>
                <li>• They'll download the FlipCash Agent app</li>
                <li>• You can start assigning leads immediately</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={createAgentMutation.isPending}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createAgentMutation.isPending}
                className="flex-1 px-4 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {createAgentMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Add Agent
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddAgentModal;