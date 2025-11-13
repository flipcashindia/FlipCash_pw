// src/components/partner/KycOnboardingModal.tsx
import React, { useEffect, useState } from 'react';
import { type User, type PartnerProfile } from '../../api/types/api';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, X, CheckCircle, RefreshCw } from 'lucide-react'; // <-- Import RefreshCw
import { partnerService } from '../../api/services/partnerService'; // <-- Corrected path
import { useQuery, useQueryClient } from '@tanstack/react-query'; // <-- Import useQueryClient
import { usePartnerStore } from '../../stores/usePartnerStore';
import { useAuthStore } from '../../stores/authStore'; // <-- Import auth store
import { useToast } from '../../contexts/ToastContext'; // <-- Import useToast

// --- Helper Hook to fetch sub-items (Unchanged) ---
const usePartnerChecklist = (partnerId: string) => {
  const { data: bankAccounts, isLoading: bankLoading } = useQuery({
    queryKey: ['partnerBankAccounts', partnerId],
    queryFn: () => partnerService.getBankAccounts(), //
    staleTime: 300000 
  });



  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ['partnerDocuments', partnerId],
    queryFn: () => partnerService.getDocuments(), //
    staleTime: 300000
  });
  
  const { data: serviceAreas, isLoading: areasLoading } = useQuery({
    queryKey: ['partnerServiceAreas', partnerId],
    queryFn: () => partnerService.getServiceAreas(), //
    staleTime: 300000
  });

  const checklist = {
    bank: {
      isDone: !!bankAccounts?.find(b => b.is_verified), //
      isLoading: bankLoading,
    },
    docs: {
      isDone: 
        !!documents?.find(d => d.document_type === 'aadhaar' && d.verification_status === 'verified') &&
        !!documents?.find(d => d.document_type === 'pan' && d.verification_status === 'verified'),
      isLoading: docsLoading,
    },
    area: {
      isDone: !!serviceAreas?.find(a => a.is_active), //
      isLoading: areasLoading,
    }
  };

  return { checklist, isLoading: bankLoading || docsLoading || areasLoading };
};


// --- The Modal Component (Upgraded) ---
export const KycOnboardingModal: React.FC<{ user: User; partner: PartnerProfile }> = ({ user, partner }) => {
  console.log('KYC Onboarding Modal => user: ', user)
  const queryClient = useQueryClient();
  const toast = useToast();
  const { refetchPartner } = usePartnerStore();
  const { refetchUser } = useAuthStore(); // <-- Get refetch function from auth store
  const { checklist, isLoading } = usePartnerChecklist(partner.id);
  const [isRefetching, setIsRefetching] = useState(false);

  // 1. Get User KYC Status
  const kycStatus = user.kyc_status; //
  const isKycDone = kycStatus === 'verified';
  const kycStatusText = {
    pending: 'Pending',
    in_review: 'In Review',
    verified: 'Verified',
    rejected: 'Rejected',
  }[kycStatus] || 'Pending';
  
  const kycStatusColor = {
    pending: 'text-brand-yellow', //
    in_review: 'text-blue-500',
    verified: 'text-brand-green', //
    rejected: 'text-brand-red', //
  }[kycStatus] || 'text-brand-yellow';

  const allDone = isKycDone && checklist.bank.isDone && checklist.docs.isDone && checklist.area.isDone;

  useEffect(() => {
    if (allDone && !partner.profile_completed) {
      refetchPartner();
    }
  }, [allDone, partner.profile_completed, refetchPartner]);

  // --- NEW: Refresh handler ---
  const handleRefreshStatus = async () => {
    setIsRefetching(true);
    // 1. Refetch the KYC status from the User object
    await refetchUser(); 
    // 2. Refetch all data from React Query
    await queryClient.invalidateQueries({ queryKey: ['partnerBankAccounts'] });
    await queryClient.invalidateQueries({ queryKey: ['partnerDocuments'] });
    await queryClient.invalidateQueries({ queryKey: ['partnerServiceAreas'] });
    // 3. Refetch the main partner profile
    await refetchPartner();
    
    setIsRefetching(false);
    toast.success("Status updated!");
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
      {/* 1. Header with Overall KYC Status */}
      <div className="text-center border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-brand-black mb-2">Complete Your Profile</h2>
        <p className="text-gray-600 mb-4">You must complete all steps to get approved and start receiving leads.</p>
        
        {/* --- UPGRADED: Header with Refresh Button --- */}
        <div className="flex items-center justify-center space-x-2">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${kycStatusColor.replace('text-', 'bg-').replace('500', '100').replace('yellow', 'yellow-100')} ${kycStatusColor}`}>
            {kycStatus === 'verified' && <CheckCircle size={16} />}
            {kycStatus === 'pending' && <AlertCircle size={16} />}
            {kycStatus === 'rejected' && <X size={16} />}
            {kycStatus === 'in_review' && <Loader2 size={16} className="animate-spin" />}
            Identity (KYC) Status: {kycStatusText}
          </div>
          <button
            onClick={handleRefreshStatus}
            disabled={isRefetching}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-brand-black disabled:animate-spin"
            title="Refresh Status"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 2. Checklist */}
      <div className="space-y-4">
        <ChecklistItem
          title="Identity Verification (KYC)"
          description="Upload your personal documents (like Aadhaar) to verify your identity."
          isDone={isKycDone}
          isLoading={isLoading}
          linkTo="/partner/profile/kyc"
          linkText={kycStatus === 'rejected' ? 'Re-Submit' : kycStatus === 'verified' ? 'View' : 'Upload KYC'}
        />
        <ChecklistItem
          title="Partner Documents"
          description="Upload your PAN card. This is required for all partners."
          isDone={checklist.docs.isDone}
          isLoading={isLoading}
          linkTo="/partner/profile/documents"
          linkText="Upload Docs"
        />
        <ChecklistItem
          title="Add Bank Account"
          description="Add and verify a bank account to receive your payouts."
          isDone={checklist.bank.isDone}
          isLoading={isLoading}
          linkTo="/partner/profile/bank"
          linkText="Add Account"
        />
        <ChecklistItem
          title="Set Service Area"
          description="Define at least one active area where you can pick up devices."
          isDone={checklist.area.isDone}
          isLoading={isLoading}
          linkTo="/partner/profile/areas"
          linkText="Set Area"
        />
      </div>
      
      <div className="text-center mt-6 pt-4 border-t">
        <p className="text-sm text-gray-500">
          Your profile will be automatically activated once all steps are completed and verified.
        </p>
      </div>
    </div>
  );
};

// --- Sub-component for the checklist items (Unchanged) ---
const ChecklistItem: React.FC<{
  title: string;
  description: string;
  isDone: boolean;
  isLoading: boolean;
  linkTo: string;
  linkText: string;
}> = ({ title, description, isDone, isLoading, linkTo, linkText }) => {
  return (
    <div className="flex items-start p-4 bg-brand-gray-light/50 rounded-lg space-x-4">
      <div className="flex-shrink-0 mt-1">
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
          className="flex-shrink-0 px-4 py-2 bg-brand-yellow text-brand-black font-bold rounded-lg hover:opacity-80 transition text-sm self-center"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
};