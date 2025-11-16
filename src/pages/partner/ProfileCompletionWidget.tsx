// src/components/partner/ProfileCompletionWidget.tsx
/**
 * Profile Completion Widget
 * Shows profile completion status in sidebar
 * Updated to match actual API structure and integrate with auth store
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { usePartnerStore } from '../../stores/usePartnerStore';
import { useAuthStore } from '../../stores/authStore';

export const ProfileCompletionWidget: React.FC = () => {
  const { partner } = usePartnerStore();
  const { user } = useAuthStore();

  if (!partner || !user) return null;

  // Use backend-calculated completion percentage
  const completionPercentage = partner.profile_completion_percentage || 0;
  const isComplete = partner.profile_completed || completionPercentage === 100;

  // Get KYC status from user object
  const kycStatus = user.kyc_status;
  const isKycVerified = kycStatus === 'verified';
  const isKycPending = kycStatus === 'pending';
  const isKycInReview = kycStatus === 'in_review';
  const isKycRejected = kycStatus === 'rejected';

  // Determine overall status color
  const getStatusColor = () => {
    if (isComplete && isKycVerified) return 'green';
    if (isKycRejected) return 'red';
    if (isKycInReview) return 'blue';
    return 'yellow';
  };

  const statusColor = getStatusColor();

  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      hoverBorder: 'hover:border-green-300',
      icon: 'text-green-600',
      bar: 'bg-green-500',
      text: 'text-green-700',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      hoverBorder: 'hover:border-yellow-300',
      icon: 'text-yellow-600',
      bar: 'bg-yellow-400',
      text: 'text-yellow-700',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-300',
      icon: 'text-blue-600',
      bar: 'bg-blue-500',
      text: 'text-blue-700',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      hoverBorder: 'hover:border-red-300',
      icon: 'text-red-600',
      bar: 'bg-red-500',
      text: 'text-red-700',
    },
  };

  const colors = colorClasses[statusColor];

  return (
    <div className="mt-4 mx-4 mb-6">
      <Link
        to="/partner/profile"
        className={`block rounded-lg border-2 p-4 transition-all hover:shadow-md ${colors.bg} ${colors.border} ${colors.hoverBorder}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Profile Status</h3>
          {isComplete && isKycVerified ? (
            <CheckCircle2 className={`w-5 h-5 ${colors.icon}`} />
          ) : (
            <AlertCircle className={`w-5 h-5 ${colors.icon}`} />
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Completion</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${colors.bar}`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Status Messages */}
        {!isComplete && (
          <p className="text-xs text-gray-600 mb-2">
            Complete your profile to unlock all features
          </p>
        )}

        {isComplete && isKycPending && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-yellow-700 mb-1">
              KYC Pending
            </p>
            <p className="text-xs text-yellow-600">
              Please submit your KYC documents for verification
            </p>
          </div>
        )}

        {isComplete && isKycInReview && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-blue-700 mb-1">
              KYC Under Review
            </p>
            <p className="text-xs text-blue-600">
              Your documents are being verified
            </p>
          </div>
        )}

        {isKycRejected && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-red-700 mb-1">
              KYC Rejected
            </p>
            <p className="text-xs text-red-600">
              Please resubmit your documents
            </p>
          </div>
        )}

        {isComplete && isKycVerified && (
          <p className="text-xs text-green-700 font-semibold mb-2">
            ✓ Profile Complete & Verified
          </p>
        )}

        {/* Partner Status Badge */}
        {partner.status && (
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Account Status:</span>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${
                  partner.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : partner.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : partner.status === 'under_review'
                    ? 'bg-blue-100 text-blue-700'
                    : partner.status === 'suspended'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {partner.status}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-xs font-medium text-gray-700">
            {isComplete ? 'View Profile' : 'Complete Now'}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </Link>

      {/* Missing Items (if incomplete) */}
      {!isComplete && (
        <div className="mt-3 px-4 py-3 bg-white rounded-lg border border-gray-200 text-xs">
          <p className="font-semibold text-gray-700 mb-2">Complete Your Profile:</p>
          <ul className="space-y-1 text-gray-600">
            {!partner.business_name && <li>• Business Name</li>}
            {!partner.user.full_name && <li>• Full Name</li>}
            {!partner.user.phone && <li>• Phone Number</li>}
            {parseFloat(partner.service_radius_km || '0') === 0 && <li>• Service Area</li>}
            {!partner.wallet?.id && <li>• Wallet Setup</li>}
            {kycStatus === 'pending' && <li>• KYC Documents</li>}
          </ul>
          <Link
            to="/partner/profile"
            className="mt-3 block w-full text-center py-2 bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] font-semibold rounded-lg transition-colors"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Background Check Status - ✅ FIXED: Only show for pending, in_progress, or failed */}
      {partner.background_check_status && 
       (partner.background_check_status === 'pending' || 
        partner.background_check_status === 'in_progress' || 
        partner.background_check_status === 'failed') && (
        <div className="mt-3 px-4 py-3 bg-white rounded-lg border border-gray-200 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Background Check:</span>
            <span
              className={`font-semibold px-2 py-1 rounded-full capitalize ${
                partner.background_check_status === 'in_progress'
                  ? 'bg-blue-100 text-blue-700'
                  : partner.background_check_status === 'failed'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {partner.background_check_status === 'in_progress' 
                ? 'In Progress' 
                : partner.background_check_status === 'failed'
                ? 'Failed'
                : 'Pending'}
            </span>
          </div>
        </div>
      )}

      {/* Performance Stats (if verified) */}
      {isComplete && isKycVerified && (
        <div className="mt-3 px-4 py-3 bg-white rounded-lg border border-gray-200 text-xs">
          <p className="font-semibold text-gray-700 mb-2">Your Performance:</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completion Rate:</span>
              <span className="font-semibold text-[#1C1C1B]">
                {parseFloat(partner.completion_rate || '0').toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Rating:</span>
              <span className="font-semibold text-[#1C1C1B]">
                {parseFloat(partner.average_rating || '0').toFixed(1)} ⭐
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed Leads:</span>
              <span className="font-semibold text-[#1C1C1B]">
                {partner.total_leads_completed}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};