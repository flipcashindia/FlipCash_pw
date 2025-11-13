// src/utils/handleApiError.ts
import { type ApiError } from "../api/types/api";

/**
 * Parses a "detail" vs "error" vs "validation" error from the backend.
 * @param err The error object from axios
 * @returns A simple, user-friendly string.
 */
export const handleApiError = (err: any): string => {
  const error = err as ApiError;

  if (error.response?.data) {
    const data = error.response.data;

    // 1. Catches: { "detail": "Invalid OTP" }
    if (typeof data.detail === 'string') {
      return data.detail;
    }

    // 2. Catches: { "error": "Phone number already registered" }
    if (typeof data.error === 'string') {
      return data.error;
    }

    // 3. Catches: { "error": { "pan_number": ["Invalid format"] } }
    if (typeof data.error === 'object' && data.error !== null) {
      const firstKey = Object.keys(data.error)[0];
      const firstMessage = data.error[firstKey][0];
      return `${firstKey.replace(/_/g, ' ')}: ${firstMessage}`;
    }
    
    // 4. Catches: { "phone": ["Invalid format"] }
    const responseKeys = Object.keys(data);
    if (responseKeys.length > 0 && Array.isArray(data[responseKeys[0]])) {
      const firstKey = responseKeys[0];
      const firstMessage = data[firstKey][0];
       return `${firstKey.replace(/_/g, ' ')}: ${firstMessage}`;
    }
  }

  // Fallback
  return err.message || 'An unknown error occurred.';
};