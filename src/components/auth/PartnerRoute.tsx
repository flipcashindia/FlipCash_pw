// src/components/auth/PartnerRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Loader2 } from 'lucide-react';

interface PartnerRouteProps {
  children: React.ReactNode;
}

export const PartnerRoute: React.FC<PartnerRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();
  // console.log('user: ', user);
  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-gray-light">
        <Loader2 className="w-12 h-12 animate-spin text-brand-yellow" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    // User is not logged in, send them to the homepage to log in.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (user?.role !== 'partner') { //
    // User is logged in, but is a 'consumer' or other role.
    // Redirect them to the Partner Signup page as requested.
    return <Navigate to="/partner-signup" replace />;
  }

  // If authenticated AND is a partner, show the page
  return <>{children}</>;
};