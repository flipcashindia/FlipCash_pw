// src/components/partner/agents/AddAgentModal.tsx
// Modal for adding a new agent to the partner's team
// Uses: useCreateAgent hook from useAgents.ts
// Backend: POST /api/v1/partner-agents/agents/

import React, { useState, useEffect } from 'react';
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
  Hash,
  Info,
} from 'lucide-react';
import { useCreateAgent } from '../../../hooks/useAgents';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  phone: string;
  name: string;
  email: string;
  employee_code: string;
  max_concurrent_leads: number;
  notes: string;
}

const initialFormData: FormData = {
  phone: '',
  name: '',
  email: '',
  employee_code: '',
  max_concurrent_leads: 5,
  notes: '',
};

const AddAgentModal: React.FC<AddAgentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createAgentMutation = useCreateAgent();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setSuccessMessage(null);
    }
  }, [isOpen]);

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
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    // Email validation (optional but if provided must be valid)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Employee code validation (optional)
    if (formData.employee_code && formData.employee_code.length > 50) {
      newErrors.employee_code = 'Employee code must be less than 50 characters';
    }

    // Max concurrent leads validation
    if (formData.max_concurrent_leads < 1 || formData.max_concurrent_leads > 20) {
      newErrors.max_concurrent_leads = 'Must be between 1 and 20';
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
        max_concurrent_leads: formData.max_concurrent_leads,
        notes: formData.notes.trim() || undefined,
      });

      setSuccessMessage('Agent added successfully!');
      
      // Call onSuccess and close after brief delay
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      // Parse DRF validation errors
      if (err.message) {
        // Check if it's a field-specific error
        const fieldErrors: Record<string, string> = {};
        const errorMsg = err.message.toLowerCase();
        
        if (errorMsg.includes('phone') || errorMsg.includes('user with this phone')) {
          fieldErrors.phone = err.message;
        } else if (errorMsg.includes('email')) {
          fieldErrors.email = err.message;
        } else if (errorMsg.includes('employee')) {
          fieldErrors.employee_code = err.message;
        } else {
          fieldErrors.submit = err.message;
        }
        
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: 'Failed to create agent. Please try again.' });
      }
    }
  };

  const handleClose = () => {
    if (!createAgentMutation.isPending) {
      setFormData(initialFormData);
      setErrors({});
      setSuccessMessage(null);
      onClose();
    }
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits and format nicely
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digits }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
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
                disabled={createAgentMutation.isPending}
                className="text-[#1C1C1B]/60 hover:text-[#1C1C1B] transition disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[#1B8A05]/10 border-2 border-[#1B8A05] rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="text-[#1B8A05]" size={20} />
                <p className="text-[#1B8A05] font-semibold text-sm">{successMessage}</p>
              </motion.div>
            )}

            {/* Error Banner */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[#FF0000]/10 border-2 border-[#FF0000] rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="text-[#FF0000]" size={20} />
                <p className="text-[#FF0000] font-semibold text-sm">{errors.submit}</p>
              </motion.div>
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
                  disabled={createAgentMutation.isPending}
                  className={`w-full pl-14 pr-12 py-3 border-2 rounded-xl focus:outline-none transition disabled:bg-gray-100 ${
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
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter agent's full name"
                  disabled={createAgentMutation.isPending}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition disabled:bg-gray-100 ${
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
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="agent@example.com"
                  disabled={createAgentMutation.isPending}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition disabled:bg-gray-100 ${
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

            {/* Employee Code (Optional) */}
            <div>
              <label className="block font-bold text-[#1C1C1B] mb-2">
                Employee Code <span className="text-gray-400 text-sm font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <BadgeCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.employee_code}
                  onChange={(e) => handleInputChange('employee_code', e.target.value)}
                  placeholder="e.g., EMP001"
                  disabled={createAgentMutation.isPending}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition disabled:bg-gray-100 ${
                    errors.employee_code
                      ? 'border-[#FF0000] focus:border-[#FF0000]'
                      : 'border-gray-200 focus:border-[#FEC925]'
                  }`}
                />
              </div>
              {errors.employee_code && (
                <p className="text-[#FF0000] text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.employee_code}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Internal employee code for your reference
              </p>
            </div>

            {/* Max Concurrent Leads */}
            <div>
              <label className="block font-bold text-[#1C1C1B] mb-2">
                Max Concurrent Leads
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.max_concurrent_leads}
                  onChange={(e) => handleInputChange('max_concurrent_leads', parseInt(e.target.value) || 5)}
                  disabled={createAgentMutation.isPending}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition disabled:bg-gray-100 ${
                    errors.max_concurrent_leads
                      ? 'border-[#FF0000] focus:border-[#FF0000]'
                      : 'border-gray-200 focus:border-[#FEC925]'
                  }`}
                />
              </div>
              {errors.max_concurrent_leads && (
                <p className="text-[#FF0000] text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.max_concurrent_leads}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Maximum leads this agent can handle at once (1-20)
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Info size={18} />
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
                disabled={createAgentMutation.isPending || !!successMessage}
                className="flex-1 px-4 py-3 bg-[#1B8A05] text-white rounded-xl font-bold hover:bg-[#156d04] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {createAgentMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Adding...
                  </>
                ) : successMessage ? (
                  <>
                    <CheckCircle size={20} />
                    Added!
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