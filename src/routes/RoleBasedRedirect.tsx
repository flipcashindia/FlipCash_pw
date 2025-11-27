// src/components/auth/RoleBasedRedirect.tsx
// Smart redirect component that redirects users to appropriate dashboard based on role

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

/**
 * RoleBasedRedirect Component
 * 
 * Redirects authenticated users to their appropriate dashboard:
 * - Partners -> /partner/dashboard
 * - Agents -> /agent/dashboard
 * - Consumers -> /my-account (or home)
 * 
 * Usage:
 * <Route path="/dashboard" element={<RoleBasedRedirect />} />
 */
export const RoleBasedRedirect: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FEC925] mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'partner':
      return <Navigate to="/partner/dashboard" replace />;
    case 'agent':
      return <Navigate to="/agent/dashboard" replace />;
    case 'consumer':
    default:
      return <Navigate to="/my-account" replace />;
  }
};

/**
 * Hook to get the appropriate dashboard path for current user
 */
export const useDashboardPath = () => {
  const { user } = useAuthStore();
  
  if (!user) return '/';
  
  switch (user.role) {
    case 'partner':
      return '/partner/dashboard';
    case 'agent':
      return '/agent/dashboard';
    case 'consumer':
    default:
      return '/my-account';
  }
};

export default RoleBasedRedirect;