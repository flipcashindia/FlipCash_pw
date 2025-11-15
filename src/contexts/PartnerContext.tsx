import React, { createContext, useContext, useState } from 'react';
// import { type Partner } from '../types/partner.types';
import { type PartnerProfile,  type PartnerMetrics } from '../api/types/api';
import { partnerService } from '../api/services/partnerService';

interface PartnerContextType {
  partner: PartnerProfile | null;
  metrics: PartnerMetrics | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  loadMetrics: () => Promise<void>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [metrics, setMetrics] = useState<PartnerMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await partnerService.getMe();
      setPartner(data);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await partnerService.getMyMatrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics', error);
    }
  };

  return (
    <PartnerContext.Provider value={{ partner, metrics, isLoading: loading, loadProfile, loadMetrics }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartnerContext = () => {
  const context = useContext(PartnerContext);
  if (!context) throw new Error('usePartnerContext must be used within PartnerProvider');
  return context;
};