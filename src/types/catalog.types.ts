export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  category: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DeviceModel {
  id: string;
  brand: string;
  category: string;
  name: string;
  slug: string;
  image_url?: string;
  base_price: number;
  specifications: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceModelDetail extends DeviceModel {
  brand_name: string;
  category_name: string;
  storage_options?: string[];
  ram_options?: string[];
  color_options?: string[];
}

export interface CatalogFilters {
  category?: string;
  brand?: string;
  search?: string;
  is_active?: boolean;
}