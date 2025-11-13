import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Partner, type PartnerMetrics } from '../types/partner.types';
import { partnerService } from '../api/services/partnerService';

interface PartnerContextType {
  partner: Partner | null;
  metrics: PartnerMetrics | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  loadMetrics: () => Promise<void>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [metrics, setMetrics] = useState<PartnerMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await partnerService.getProfile();
      setPartner(data);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await partnerService.getMetrics();
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