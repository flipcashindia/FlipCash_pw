// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore'; // ✅ Use the correct store
import { Loader2 } from 'lucide-react'; // A cleaner spinner

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-gray-light">
        {/* Branded Loader */}
        <Loader2 className="w-12 h-12 animate-spin text-brand-yellow" /> {/* */}
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the intended location
    // Note: Your original file redirected to "/", I changed this to "/login"
    // which is more standard.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};