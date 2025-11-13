// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type VerifyLoginOtpResponse } from '../api/services/authService2'; // Assuming authService.ts
import { type User } from '../api/types/api'; // Assuming api.ts
import { privateApiClient } from '../api/client/apiClient'; // Assuming apiClient.ts

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, code: string, device_id: string) => Promise<VerifyLoginOtpResponse>;
  logout: () => void;
  // setUser: (user: User | null) => void; // This is handled internally now
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On app load, check for existing session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedToken && storedRefreshToken) {
        setAccessToken(storedToken);
        setRefreshToken(storedRefreshToken);
        privateApiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        try {
          // Check if token is valid by fetching user profile
          const me = await authService.getMe(); //
          setUser(me);
        } catch (error) {
          // Token is invalid or expired
          console.error('Session restore failed', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setAccessToken(null);
          setRefreshToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // --- THIS IS THE MISSING FUNCTION ---
  const login = useCallback(async (phone: string, code: string, device_id: string) => {
    const response = await authService.verifyLoginOtp({ phone, code, device_id }); //
    
    // Set state
    setUser(response.user);
    setAccessToken(response.tokens.access);
    setRefreshToken(response.tokens.refresh);

    // Persist to local storage
    localStorage.setItem('accessToken', response.tokens.access);
    localStorage.setItem('refreshToken', response.tokens.refresh);

    // Set token for all future private requests
    privateApiClient.defaults.headers.common['Authorization'] = `Bearer ${response.tokens.access}`;

    return response;
  }, []);

  const logout = useCallback(async () => {
    if (refreshToken) {
      try {
        await authService.logout({ refresh: refreshToken }); //
      } catch (error) {
        console.error('Logout API call failed', error);
      }
    }
    
    // Clear state
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    // Clear from local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Clear token from private client
    delete privateApiClient.defaults.headers.common['Authorization'];

    // Redirect to home
    navigate('/');
  }, [refreshToken, navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login, // <-- Now 'login' is provided
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};