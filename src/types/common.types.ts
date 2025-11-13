export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface Address {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface FileUpload {
  file: File;
  preview?: string;
  uploadProgress?: number;
}

export interface PresignedUrl {
  file: string;
  url: string;
  method: string;
  file_url: string;
}

export type SortOrder = 'asc' | 'desc';

export interface FilterParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}