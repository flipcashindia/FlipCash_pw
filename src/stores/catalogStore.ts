import { create } from 'zustand';
import { type Category, type Brand, type DeviceModel } from '../types/catalog.types';

interface CatalogStore {
  categories: Category[];
  brands: Brand[];
  models: DeviceModel[];
  isLoading: boolean;
  lastUpdated: number | null;
  setCategories: (categories: Category[]) => void;
  setBrands: (brands: Brand[]) => void;
  setModels: (models: DeviceModel[]) => void;
  setLoading: (value: boolean) => void;
  updateTimestamp: () => void;
  clear: () => void;
}

export const useCatalogStore = create<CatalogStore>((set) => ({
  categories: [],
  brands: [],
  models: [],
  isLoading: false,
  lastUpdated: null,
  setCategories: (categories) => set({ categories }),
  setBrands: (brands) => set({ brands }),
  setModels: (models) => set({ models }),
  setLoading: (value) => set({ isLoading: value }),
  updateTimestamp: () => set({ lastUpdated: Date.now() }),
  clear: () => set({ categories: [], brands: [], models: [], lastUpdated: null }),
}));