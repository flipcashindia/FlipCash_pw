import { useState } from 'react';
import { getCurrentLocation } from '../utils/locationUtils';
import { type Location } from '../types/common.types';

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const coords = await getCurrentLocation();
      setLocation(coords);
      return coords;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    loading,
    error,
    getLocation,
  };
};