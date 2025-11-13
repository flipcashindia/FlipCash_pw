import { useEffect } from 'react';
import { useCatalogStore } from '../stores/catalogStore';
import { catalogService } from '../api/services/catalogService';
import { cacheManager } from '../utils/storage';
import { CACHE_KEYS, CACHE_TTL } from '../config/constants';

export const useCatalog = () => {
  const { categories, brands, models, isLoading, lastUpdated, setCategories, setBrands, setModels, setLoading, updateTimestamp } = useCatalogStore();

  const loadCategories = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = cacheManager.get(CACHE_KEYS.CATALOG_CATEGORIES);
      if (cached) {
        setCategories(cached);
        return;
      }
    }

    try {
      setLoading(true);
      const data = await catalogService.getCategories();
      setCategories(data);
      cacheManager.set(CACHE_KEYS.CATALOG_CATEGORIES, data, CACHE_TTL.CATALOG);
      updateTimestamp();
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async (categoryId?: string, forceRefresh = false) => {
    if (!forceRefresh && !categoryId) {
      const cached = cacheManager.get(CACHE_KEYS.CATALOG_BRANDS);
      if (cached) {
        setBrands(cached);
        return;
      }
    }

    try {
      setLoading(true);
      const data = await catalogService.getBrands(categoryId ? { category: categoryId } : undefined);
      setBrands(data);
      if (!categoryId) {
        cacheManager.set(CACHE_KEYS.CATALOG_BRANDS, data, CACHE_TTL.CATALOG);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async (filters?: any, forceRefresh = false) => {
    if (!forceRefresh && !filters) {
      const cached = cacheManager.get(CACHE_KEYS.CATALOG_MODELS);
      if (cached) {
        setModels(cached);
        return;
      }
    }

    try {
      setLoading(true);
      const data = await catalogService.getModels(filters);
      setModels(data);
      if (!filters) {
        cacheManager.set(CACHE_KEYS.CATALOG_MODELS, data, CACHE_TTL.MODELS);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    brands,
    models,
    isLoading,
    lastUpdated,
    loadCategories,
    loadBrands,
    loadModels,
  };
};