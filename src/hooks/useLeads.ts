import { useState } from 'react';
import { useLeadsStore } from '../stores/leadsStore';
import { useWalletStore } from '../stores/walletStore';
import { leadsService } from '../api/services/leadsService';
import { handleApiError } from '../utils/errorHandler';
import { type LeadFilters } from '../types/lead.types';

export const useLeads = () => {
  const { availableLeads, myLeads, stats, isLoading, setAvailableLeads, setMyLeads, setStats, setLoading, setError, removeAvailableLead, addMyLead } = useLeadsStore();
  const { updateBalance } = useWalletStore();
  const [claimLoading, setClaimLoading] = useState(false);

  const loadAvailableLeads = async (filters?: LeadFilters) => {
    try {
      setLoading(true);
      const response = await leadsService.getAvailableLeads(filters);
      setAvailableLeads(response.results);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadMyLeads = async (filters?: LeadFilters) => {
    try {
      setLoading(true);
      const response = await leadsService.getMyLeads(filters);
      setMyLeads(response.results);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await leadsService.getStats();
      setStats(data);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const claimLead = async (leadId: string) => {
    try {
      setClaimLoading(true);
      const result = await leadsService.claimLead(leadId);
      removeAvailableLead(leadId);
      addMyLead(result.lead);
      updateBalance(result.new_wallet_balance);
      return result;
    } catch (err) {
      throw new Error(handleApiError(err));
    } finally {
      setClaimLoading(false);
    }
  };

  const unclaimLead = async (leadId: string) => {
    try {
      await leadsService.unclaimLead(leadId);
      await loadMyLeads();
      await loadAvailableLeads();
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  return {
    availableLeads,
    myLeads,
    stats,
    isLoading,
    claimLoading,
    loadAvailableLeads,
    loadMyLeads,
    loadStats,
    claimLead,
    unclaimLead,
  };
};