// src/components/auth/AgentRoute.tsx
// Route guard for Agent-only routes
// Redirects non-agent users away from agent pages

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface AgentRouteProps {
  children: React.ReactNode;
}

export const AgentRoute: React.FC<AgentRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FEC925] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user is an agent
  // The user role should be 'agent' for agent users
  if (user?.role !== 'agent') {
    // If user is a partner, redirect to partner dashboard
    if (user?.role === 'partner') {
      return <Navigate to="/partner/dashboard" replace />;
    }
    // Otherwise redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AgentRoute;