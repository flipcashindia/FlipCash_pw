// src/stores/usePartnerStore.ts
import { create } from 'zustand';
import { partnerService } from '../api/services/partnerService'; // Corrected path
import { type PartnerProfile } from '../api/types/api';
import { useAuthStore } from './authStore'; // Listens to the auth store

// --- Interface for the Store ---
interface PartnerState {
  partner: PartnerProfile | null;
  isLoading: boolean;
  fetchPartnerProfile: () => Promise<void>;
  clearPartnerProfile: () => void;
  refetchPartner: () => Promise<void>;
}

// --- The Store ---
export const usePartnerStore = create<PartnerState>((set, get) => ({
  partner: null,
  isLoading: false,

  /**
   * Fetches the detailed partner profile
   * API 1.1: Get Partner Profile
   */
  fetchPartnerProfile: async () => {
    set({ isLoading: true });
    try {
      const data = await partnerService.getMe(); //
      // console.log('Fetched partner profile in store: ', data);
      // console.log('Partner status: ', data.status); 
      set({ partner: data, isLoading: false });
      // console.log('Partner profile set in store: ', get().partner);
    } catch (error) {
      console.error('Failed to fetch partner profile', error);
      set({ partner: null, isLoading: false });
    }
    // console.log('Partner profile fetch complete. Profile : ', get().partner);
  },

  /**
   * Clears partner data from the store
   */
  clearPartnerProfile: () => {
    set({ partner: null });
  },

  /**
   * Alias for refetching profile data
   */
  refetchPartner: async () => {
    await get().fetchPartnerProfile();
  },
}));

// --- Synchronization Logic ---

/**
 * Checks the current auth state and fetches the partner profile if needed.
 * This is used to handle the "page refresh" case where the user is already
 * logged in when this store is initialized.
 */
const checkAuthAndFetchPartner = () => {
  const { user } = useAuthStore.getState();
  const { partner, isLoading } = usePartnerStore.getState();

  // If user is 'partner', we don't have a profile, and we're not already loading...
  if (user?.role === 'partner' && !partner && !isLoading) {
    console.log('✅ TRIGGERING PARTNER FETCH (Initial check on load)');
    // No timeout needed here, it's not in a react render
    usePartnerStore.getState().fetchPartnerProfile();
  }
};

/**
 * 1. Listen for auth *changes* (e.g., user logs in)
 */

useAuthStore.subscribe((state, prevState) => {
  const userJustLoaded = (!prevState.user && state.user) || (prevState.isLoading && !state.isLoading && state.user);
  
  if (userJustLoaded && state.user?.role === 'partner') {
    // console.log('✅ TRIGGERING PARTNER FETCH (Auth state changed)');
    // Use timeout to ensure this runs after the state update is fully complete
    setTimeout(() => {
      usePartnerStore.getState().fetchPartnerProfile();
    }, 0);
  }
});

/**
 * 2. Clear partner data when user logs out
 */
useAuthStore.subscribe((state, prevState) => {
  const isJustLoggedOut = prevState.user && !state.user;
  if (isJustLoggedOut) {
    // console.log('❌ CLEARING PARTNER PROFILE (User logged out)');
    usePartnerStore.getState().clearPartnerProfile();
  }
});

/**
 * 3. Run the initial check *immediately* when this file is loaded.
 */
checkAuthAndFetchPartner();