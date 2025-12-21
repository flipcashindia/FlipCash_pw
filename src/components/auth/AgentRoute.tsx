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
  // Check if user is an agent OR a partner with self-agent capability
  if (user?.role === 'agent') {
    // Regular agent - allow access
    return <>{children}</>;
  }

  if (user?.role === 'partner') {
    // Partner - check if they can work as self-agent
    // This will be verified by the API when they access agent endpoints
    // For now, allow access and let the API determine if they have agent profile
    return <>{children}</>;
  }

  // Not an agent or partner - redirect to home
  return <Navigate to="/" replace />;
    return <>{children}</>;
  };

export default AgentRoute;