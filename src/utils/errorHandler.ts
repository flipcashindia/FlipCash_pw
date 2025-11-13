import { AxiosError } from 'axios';
import { type ErrorResponse } from '../types/api.types';

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as ErrorResponse;
    
    if (errorData?.detail) {
      return errorData.detail;
    }
    
    if (errorData?.message) {
      return errorData.message;
    }
    
    if (errorData?.errors) {
      const firstError = Object.values(errorData.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    }
    
    if (error.response?.status === 401) {
      return 'Session expired. Please login again.';
    }
    
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    
    if (error.response?.status === 404) {
      return 'Resource not found.';
    }
    
    if (error.response?.status === 500) {
      return 'Server error. Please try again later.';
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const logError = (error: unknown, context?: string): void => {
  if (import.meta.env.VITE_ENABLE_LOGGING === 'true') {
    console.error(`[${context || 'Error'}]:`, error);
  }
};