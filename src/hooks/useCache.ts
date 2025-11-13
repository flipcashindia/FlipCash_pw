import { useState, useEffect } from 'react';
import { cacheManager } from '../utils/storage';

export const useCache = <T>(key: string, fetcher: () => Promise<T>, ttl?: number) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = cacheManager.get<T>(key);
      if (cached) {
        setData(cached);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
      cacheManager.set(key, result, ttl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [key]);

  const refresh = () => loadData(true);
  const clear = () => {
    cacheManager.remove(key);
    setData(null);
  };

  return { data, loading, error, refresh, clear };
};