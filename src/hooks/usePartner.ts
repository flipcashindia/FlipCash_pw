// import { useEffect } from 'react';
import { usePartnerStore } from '../stores/partnerStore';
// import { partnerService } from '../api/services/partnerService';
// import { handleApiError } from '../utils/errorHandler';

export const usePartner = () => {
  const { partner, metrics, isLoading, error,  } = usePartnerStore();  //setPartner, setMetrics, setLoading, setError

  // const loadProfile = async () => {
  //   try {
  //     setLoading(true);
  //     const data = await partnerService.getProfile();
  //     setPartner(data);
  //   } catch (err) {
  //     setError(handleApiError(err));
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const loadMetrics = async () => {
  //   try {
  //     const data = await partnerService.getMetrics();
  //     setMetrics(data);
  //   } catch (err) {
  //     setError(handleApiError(err));
  //   }
  // };

  return {
    partner,
    metrics,
    isLoading,
    error,
    // loadProfile,
    // loadMetrics,
  };
};