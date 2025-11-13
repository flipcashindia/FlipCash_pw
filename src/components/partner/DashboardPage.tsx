// src/pages/partner/PartnerDashboardPage.tsx
import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { usePartnerStore } from '../../stores/usePartnerStore';
import { Loader2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { OnboardingChecklist } from './OnboardingChecklist';
import { ActiveDashboard } from './ActiveDashboard';

const PartnerDashboardPage: React.FC = () => {
  const { user } = useAuthStore(); // Get the full user object
  console.log('Dashboard => user: ', user);
  const { partner, isLoading } = usePartnerStore(); // Get the partner profile
  console.log('isLoading:', isLoading); 
  console.log('Dashboard => partner', partner);
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-gray-light">
        <Loader2 className="w-12 h-12 animate-spin text-brand-yellow" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-gray-light p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg">
          <XCircle className="w-16 h-16 text-brand-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-black mb-2">Error</h2>
          <p className="text-gray-600">Could not load your partner profile. This can happen if your account is new and still being provisioned. Please try again in a moment.</p>
        </div>
      </div>
    );
  }

  // --- Partner Status State Machine ---

  // State 1: PENDING or UNDER REVIEW
  if (partner.status === 'pending' || partner.status === 'under_review') { //
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-brand-gray-light p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg">
          <Info className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-black mb-2">Application Submitted!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Your profile is currently <strong className="text-blue-600 capitalize">{partner.status.replace('_', ' ')}</strong>.
          </p>
          <p className="text-gray-600">
            Thank you for registering. Our team will review your application and notify you via SMS once it's approved.
          </p>
        </div>
      </div>
    );
  }

  // State 2: REJECTED or SUSPENDED
  if (partner.status === 'rejected' || partner.status === 'suspended') { //
     return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-brand-gray-light p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg">
          <AlertTriangle className="w-16 h-16 text-brand-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-black mb-2">Account {partner.status}</h2>
          <p className="text-gray-600">
            There is an issue with your account. Please contact partner support for more details.
          </p>
        </div>
      </div>
    );
  }

  // State 3: APPROVED but profile INCOMPLETE
  if (partner.status === 'approved' && !partner.profile_completed) { //
    return (
      <OnboardingChecklist user={user} partner={partner} />
    );
  }

  // State 4: APPROVED and profile COMPLETE
  if (partner.status === 'approved' && partner.profile_completed) { //
    return (
      <ActiveDashboard partner={partner} />
    );
  }

  // Fallback
  return (
    <div className="p-8 text-center">
      <p>An unknown error occurred. Please contact support.</p>
    </div>
  );
};

export default PartnerDashboardPage;