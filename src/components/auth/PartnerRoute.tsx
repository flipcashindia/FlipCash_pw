// src/components/auth/PartnerRoute.tsx
// Route guard for Partner-only routes
// Protects /partner/* routes and redirects based on user role

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

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FEC925] mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // User is not logged in - redirect to homepage
  if (!isAuthenticated()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is an agent - redirect to agent dashboard
  if (user?.role === 'agent') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  // User is not a partner (consumer or undefined) - redirect to partner signup
  if (user?.role !== 'partner') {
    return <Navigate to="/partner-signup" replace />;
  }

  // User is authenticated AND is a partner - allow access
  return <>{children}</>;
};

export default PartnerRoute;