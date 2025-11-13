export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'FlipCash Partner',
  version: '1.0.0',
  enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
};