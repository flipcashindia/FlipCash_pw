export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ErrorResponse {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  status: number;
}