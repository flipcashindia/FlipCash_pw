import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../api/services/authService';
import { isAuthenticated } from '../api/client';

export const useAuth = () => {
  const { user, isAuthenticated: authenticated, isLoading, setUser, setAuthenticated, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        setAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, [setAuthenticated, setLoading]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
    }
  };

  return {
    user,
    isAuthenticated: authenticated,
    isLoading,
    logout: handleLogout,
    setUser,
  };
};