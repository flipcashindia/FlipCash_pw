
// src/api/services/catalogService.ts
import { privateApiClient } from '../client/apiClient';

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  available_lead_count: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  available_lead_count: number;
}

export interface Model {
  id: string;
  name: string;
  slug: string;
  model_number: string;
  primary_image: string;
  storage_options: string[];
  ram_options: string[];
  available_lead_count: number;
  base_price: string;
  launch_year: number;
}

export interface Lead {
  id: string;
  lead_number: string;
  device: {
    model_id: string;
    model_name: string;
    brand_name: string;
    category_name: string;
    storage: string;
    ram: string;
    color: string;
    image: string;
  };
  pricing: {
    estimated_price: string;
    claim_fee: string;
  };
  location: {
    city: string;
    postal_code: string;
  };
  schedule: {
    preferred_date: string;
    preferred_time_slot: string;
  };
  priority: {
    is_urgent: boolean;
    is_flagged: boolean;
    priority_score: number;
  };
  created_at: string;
  expires_at: string;
}

export interface LeadDetail {
  id: string;
  lead_number: string;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
  device: {
    model_id: string;
    model_name: string;
    brand_name: string;
    category_name: string;
    model_number: string;
    launch_year: number;
    storage: string;
    ram: string;
    color: string;
    images: { id: string; image: string; is_primary: boolean }[];
    base_price: string;
  };
  condition: {
    responses: Record<string, any>;
    photos: string[];
    customer_notes: string;
  };
  pricing: {
    estimated_price: string;
    pricing_version: string;
    claim_fee: string;
  };
  pickup: {
    address: {
      recipient_name: string;
      city: string;
      state: string;
      postal_code: string;
    };
    preferred_date: string;
    preferred_time_slot: string;
  };
  priority: {
    is_urgent: boolean;
    is_flagged: boolean;
    flagged_reason: string | null;
    priority_score: number;
  };
  created_at: string;
  booked_at: string;
  expires_at: string;
  can_claim: boolean;
}

interface PaginatedResponse<T> {
  count: number;
  results: T[];
  next?: string | null;
  previous?: string | null;
}

// Service
export const catalogService = {
  async getCategories(): Promise<PaginatedResponse<Category>> {
    const { data } = await privateApiClient.get('/partner/browse/categories/');
    console.log('categories data : ', data);

    return data;
  },

  async getBrands(categoryId: string): Promise<PaginatedResponse<Brand>> {
    const { data } = await privateApiClient.get(
      `/partner/browse/categories/${categoryId}/brands/`
    );
    console.log('brands data : ', data);

    return data;
  },

  async getModels(categoryId: string, brandId: string): Promise<PaginatedResponse<Model>> {
    const { data } = await privateApiClient.get(
      `/partner/browse/categories/${categoryId}/brands/${brandId}/models/`
    );
    console.log("brand's models data : ", data);
    console.log('models data : ', data);

    return data;
  },

  async getLeads(modelId: string): Promise<PaginatedResponse<Lead>> {
    const { data } = await privateApiClient.get(
      `/partner/browse/models/${modelId}/leads/`
    );
    console.log('Models leads data : ', data);
    console.log('Leads data : ', data);

    return data;
  },

  async getLeadDetail(leadId: string): Promise<LeadDetail> {
    const { data } = await privateApiClient.get(
      `/partner/browse/leads/${leadId}/`
    );
    console.log('Leads detail data : ', data);

    return data;
  },
};