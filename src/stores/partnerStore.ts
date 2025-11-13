import { create } from 'zustand';
import { type Partner, type PartnerMetrics } from '../types/partner.types';

interface PartnerStore {
  partner: Partner | null;
  metrics: PartnerMetrics | null;
  isLoading: boolean;
  error: string | null;
  setPartner: (partner: Partner | null) => void;
  setMetrics: (metrics: PartnerMetrics | null) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const usePartnerStore = create<PartnerStore>((set) => ({
  partner: null,
  metrics: null,
  isLoading: false,
  error: null,
  setPartner: (partner) => set({ partner }),
  setMetrics: (metrics) => set({ metrics }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  clear: () => set({ partner: null, metrics: null, error: null }),
}));