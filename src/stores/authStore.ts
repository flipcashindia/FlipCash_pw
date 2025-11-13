// src/stores/useAuthStore.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
// Make sure this path is correct for your project
import { authService, type VerifyLoginOtpResponse } from '../api/services/authService2'; 
import { type User } from '../api/types/api';
import { privateApiClient } from '../api/client/apiClient';

// --- Interface for the Store (Combined) ---
interface AuthState {
  user: User | null;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  
  setUser: (user: User | null) => void;
  setLoading: (value: boolean) => void;
  isAuthenticated: () => boolean;
  
  login: (phone: string, code: string, device_id: string) => Promise<VerifyLoginOtpResponse>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  setTokens: (access: string, refresh: string) => void;
  
  // --- THIS IS THE FIX ---
  refetchUser: () => Promise<void>; // For refreshing KYC status
}

// --- The Store (Combined) ---
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: true, // Start in loading state until initAuth runs

      // --- Simple Setters ---
      setUser: (user) => set({ user }),
      setLoading: (value) => set({ isLoading: value }),

      // --- Derived Value ---
      isAuthenticated: () => !!get().accessToken,

      // --- API-Driven Functions ---
      setTokens: (access: string, refresh: string) => {
        set({ accessToken: access, refreshToken: refresh });
        privateApiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      },

      login: async (phone, code, device_id) => {
        const response = await authService.verifyLoginOtp({ phone, code, device_id }); //
        set({
          user: response.user,
          accessToken: response.tokens.access,
          refreshToken: response.tokens.refresh,
          isLoading: false,
        });
        privateApiClient.defaults.headers.common['Authorization'] = `Bearer ${response.tokens.access}`;
        return response;
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await authService.logout({ refresh: refreshToken }); //
          } catch (error) {
            console.error('Logout API call failed', error);
          }
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
        });
        delete privateApiClient.defaults.headers.common['Authorization'];
      },

      initAuth: async () => {
        const { accessToken, refreshToken, logout } = get();
        if (accessToken && refreshToken) {
          try {
            privateApiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            const me = await authService.getMe(); //
            set({ user: me, isLoading: false });
          } catch (error) {
            console.error('Session restore failed', error);
            logout(); 
          }
        } else {
          set({ isLoading: false }); 
        }
      },
      
      // --- THIS IS THE FIX ---
      refetchUser: async () => {
        try {
          // Fetches the latest user data (including new kyc_status)
          const me = await authService.getMe(); //
          set({ user: me }); // Update the user object in the store
        } catch (error) {
          console.error('Failed to refetch user', error);
          // Don't log out, just fail silently
        }
      }
    }),
    {
      name: 'flipcash-auth-storage', 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);