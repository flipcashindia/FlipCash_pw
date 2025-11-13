// src/components/partner/OnboardingChecklist.tsx
import React, { useState, useEffect } from 'react';
import { type User, type PartnerProfile } from '../../api/types/api';
import { Link } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { partnerService } from '../../api/services/partnerService2'; // Assuming you have these services
import { usePartnerStore } from '../../stores/usePartnerStore';

interface ChecklistProps {
  user: User;
  partner: PartnerProfile;
}

// Helper hook to check for related items
const useChecklistItem = (fetchFunction: () => Promise<any[]>) => {
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFunction()
      .then(data => {
        if (data && data.length > 0) {
          setIsDone(true);
        }
      })
      .catch(() => setIsDone(false))
      .finally(() => setIsLoading(false));
  }, [fetchFunction]);

  return { isDone, isLoading };
};

const ChecklistItem: React.FC<{
  title: string;
  description: string;
  isDone: boolean;
  isLoading: boolean;
  linkTo: string;
  linkText: string;
}> = ({ title, description, isDone, isLoading, linkTo, linkText }) => {
  return (
    <div className="flex items-start p-4 bg-white rounded-lg shadow space-x-4">
      <div className="flex-shrink-0">
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        ) : isDone ? (
          <CheckCircle className="w-6 h-6 text-brand-green" />
        ) : (
          <AlertCircle className="w-6 h-6 text-brand-yellow" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-brand-black">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {!isDone && !isLoading && (
        <Link 
          to={linkTo} 
          className="flex-shrink-0 px-4 py-2 bg-brand-yellow text-brand-black font-bold rounded-lg hover:opacity-80 transition text-sm"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
};

export const OnboardingChecklist: React.FC<ChecklistProps> = ({ user, partner }) => {
  const { refetchPartner } = usePartnerStore(); // To refresh profile on completion
  
  // 1. Check KYC
  const isKycDone = user.kyc_status === 'verified'; //
  console.log('user data : ', user);
  
  // 2. Check Bank Account (using API)
  const { isDone: isBankDone, isLoading: isBankLoading } = useChecklistItem(
    partnerService.getBankAccounts //
  );
  
  // 3. Check Service Area (using API)
  const { isDone: isServiceAreaDone, isLoading: isServiceAreaLoading } = useChecklistItem(
    partnerService.getServiceAreas //
  );
  
  // 4. Check Required Documents (Aadhar + PAN)
  const { isDone: isDocsDone, isLoading: isDocsLoading } = useChecklistItem(
    async () => {
      const docs = await partnerService.getDocuments(); //
      const hasAadhaar = docs.some(d => d.document_type === 'aadhaar' && d.verification_status === 'verified');
      const hasPan = docs.some(d => d.document_type === 'pan' && d.verification_status === 'verified');
      return (hasAadhaar && hasPan) ? [true] : []; // Return array to satisfy hook
    }
  );

  const isLoading = isBankLoading || isServiceAreaLoading || isDocsLoading;
  const allDone = isKycDone && isBankDone && isServiceAreaDone && isDocsDone;

  useEffect(() => {
    // If all tasks are done, refresh the partner profile
    // This will trigger the backend to recalculate 'profile_completed' to true
    if (allDone) {
      refetchPartner();
    }
  }, [allDone, refetchPartner]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-brand-gray-light p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
          <CheckCircle className="w-16 h-16 text-brand-green mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-brand-black text-center mb-2">Welcome to FlipCash!</h2>
          <p className="text-lg text-gray-600 text-center mb-6">
            Your account is approved! Let's complete your profile to start receiving leads.
          </p>
          

          <div className="border-t pt-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-brand-black">Your Onboarding Checklist</h3>
              <div className="text-right">
                <p className="text-lg font-bold text-brand-black">{partner.profile_completion_percentage}%</p>
                <p className="text-xs text-gray-500">Complete</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-brand-yellow h-4 rounded-full transition-all duration-500"
                style={{ width: `${partner.profile_completion_percentage}%` }}
              />
            </div>
            
            <div className="space-y-4 pt-4">
              <ChecklistItem
                title="Verify Your Identity (KYC)"
                description="Upload your personal documents to verify your identity."
                isDone={isKycDone}
                isLoading={isLoading}
                linkTo="/partner/profile/kyc"
                linkText="Upload KYC"
              />
              <ChecklistItem
                title="Upload Documents"
                description="Aadhaar and PAN card are required to become a partner."
                isDone={isDocsDone}
                isLoading={isLoading}
                linkTo="/partner/profile/documents"
                linkText="Upload Docs"
              />
              <ChecklistItem
                title="Add Bank Account"
                description="Add a verified bank account to receive payouts."
                isDone={isBankDone}
                isLoading={isLoading}
                linkTo="/partner/profile/bank"
                linkText="Add Account"
              />
              <ChecklistItem
                title="Set Service Area"
                description="Define the areas where you can pick up devices."
                isDone={isServiceAreaDone}
                isLoading={isLoading}
                linkTo="/partner/profile/areas"
                linkText="Set Area"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};