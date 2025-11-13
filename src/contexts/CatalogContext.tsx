import React, { createContext, useContext, useState } from 'react';
import { type Category, type Brand, type DeviceModel } from '../types/catalog.types';
import { catalogService } from '../api/services/catalogService';
import { cacheManager } from '../utils/storage';
import { CACHE_KEYS } from '../config/constants';

interface CatalogContextType {
  categories: Category[];
  brands: Brand[];
  models: DeviceModel[];
  loadCategories: () => Promise<void>;
  loadBrands: (categoryId?: string) => Promise<void>;
  loadModels: (filters?: any) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);

  const loadCategories = async () => {
    const cached = cacheManager.get<Category[]>(CACHE_KEYS.CATALOG_CATEGORIES);
    if (cached) {
      setCategories(cached);
      return;
    }
    const data = await catalogService.getCategories();
    setCategories(data);
    cacheManager.set(CACHE_KEYS.CATALOG_CATEGORIES, data);
  };

  const loadBrands = async (categoryId?: string) => {
    const data = await catalogService.getBrands(categoryId ? { category: categoryId } : undefined);
    setBrands(data);
  };

  const loadModels = async (filters?: any) => {
    const data = await catalogService.getModels(filters);
    setModels(data);
  };

  return (
    <CatalogContext.Provider value={{ categories, brands, models, loadCategories, loadBrands, loadModels }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalogContext = () => {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalogContext must be used within CatalogProvider');
  return context;
};