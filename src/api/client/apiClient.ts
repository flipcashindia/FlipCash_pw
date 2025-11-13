// src/api/apiClient.ts
import axios from 'axios';
// This is a placeholder. Replace with your actual auth store (Zustand, Redux, Context)
import { useAuthStore } from '../../stores/authStore';

// Get API base URL from environment variables
const API_BASE_URL = 'http://localhost:8000/api/v1' //|| import.meta.env.VITE_API_BASE_URL || 'https://api.flipcash.in/api/v1';

/**
 * Public Client
 * No auth token. Used for login, signup, token refresh.
 */
export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Private Client
 * Attaches auth token to every request.
 * Used for all authenticated calls (e.g., GET /me, GET /partners/me)
 */
export const privateApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor to add Auth Token ---
privateApiClient.interceptors.request.use(
  (config) => {
    // Get token from your auth store
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; //
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Interceptor to Refresh Token on 401 ---
privateApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore.getState();

    // Check for 401, ensure it's a token-related error, and prevent infinite loops
    if (error.response.status === 401 && error.response.data?.code === 'token_not_valid' && !originalRequest._retry) { //
      originalRequest._retry = true;

      try {
        const { refreshToken, setTokens } = authStore;
        if (!refreshToken) {
          authStore.logout(); // No refresh token, force logout
          return Promise.reject(error);
        }

        // Call the public client to refresh the token
        const { data } = await publicApiClient.post('/accounts/auth/token/refresh/', { //
          refresh: refreshToken,
        });

        // Save new token
        setTokens(data.access, refreshToken);
        
        // Update the header for the original (failed) request
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
        
        // Retry the original request
        return privateApiClient(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed (e.g., refresh token also expired)
        authStore.logout(); // Force logout
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);