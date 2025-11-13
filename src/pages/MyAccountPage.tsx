import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePartner } from '../hooks/usePartner';
import PartnerDashboard from '../components/partner/PartnerDashboard';
import KYCVerification from '../components/partner/KYCVerification';
import { Loader } from '../components/common/Loader';

const MyAccountPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { partner, isLoading: partnerLoading } = usePartner();

  if (authLoading || partnerLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/" />;

  if (partner?.kyc_status === 'pending' || partner?.kyc_status === 'rejected') {
    return <KYCVerification partnerData={{ name: '', email: '', mobile: '' }} onKycComplete={() => window.location.reload()} />;
  }

  return <PartnerDashboard />;
};

export default MyAccountPage;