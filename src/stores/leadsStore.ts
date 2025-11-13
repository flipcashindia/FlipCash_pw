import { create } from 'zustand';
import { type Lead, type LeadStats } from '../types/lead.types';

interface LeadsStore {
  availableLeads: Lead[];
  myLeads: Lead[];
  stats: LeadStats | null;
  isLoading: boolean;
  error: string | null;
  setAvailableLeads: (leads: Lead[]) => void;
  setMyLeads: (leads: Lead[]) => void;
  setStats: (stats: LeadStats | null) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  removeAvailableLead: (leadId: string) => void;
  addMyLead: (lead: Lead) => void;
  clear: () => void;
}

export const useLeadsStore = create<LeadsStore>((set) => ({
  availableLeads: [],
  myLeads: [],
  stats: null,
  isLoading: false,
  error: null,
  setAvailableLeads: (leads) => set({ availableLeads: leads }),
  setMyLeads: (leads) => set({ myLeads: leads }),
  setStats: (stats) => set({ stats }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  removeAvailableLead: (leadId) =>
    set((state) => ({
      availableLeads: state.availableLeads.filter((l) => l.id !== leadId),
    })),
  addMyLead: (lead) =>
    set((state) => ({
      myLeads: [lead, ...state.myLeads],
    })),
  clear: () => set({ availableLeads: [], myLeads: [], stats: null, error: null }),
}));