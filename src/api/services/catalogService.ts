import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { type Category, type Brand, type DeviceModel, type DeviceModelDetail, type CatalogFilters } from '../../types/catalog.types';

export const catalogService = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get(API_ENDPOINTS.CATALOG.CATEGORIES);
    return response.data.results || response.data;
  },

  async getBrands(filters?: CatalogFilters): Promise<Brand[]> {
    const response = await apiClient.get(API_ENDPOINTS.CATALOG.BRANDS, { params: filters });
    return response.data.results || response.data;
  },

  async getModels(filters?: CatalogFilters): Promise<DeviceModel[]> {
    const response = await apiClient.get(API_ENDPOINTS.CATALOG.MODELS, { params: filters });
    return response.data.results || response.data;
  },

  async getModelDetail(id: string): Promise<DeviceModelDetail> {
    const response = await apiClient.get(API_ENDPOINTS.CATALOG.MODEL_DETAIL(id));
    return response.data;
  },

  async search(query: string): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.CATALOG.SEARCH, {
      params: { q: query },
    });
    return response.data;
  },
};