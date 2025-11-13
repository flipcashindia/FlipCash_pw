import { CACHE_KEYS, CACHE_TTL } from '../config/constants';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const cacheManager = {
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || CACHE_TTL.CATALOG,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item: CacheItem<T> = JSON.parse(itemStr);
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      return item.data;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    Object.values(CACHE_KEYS).forEach((key) => localStorage.removeItem(key));
  },

  isExpired(key: string): boolean {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return true;

    try {
      const item: CacheItem<any> = JSON.parse(itemStr);
      return Date.now() - item.timestamp > item.ttl;
    } catch {
      return true;
    }
  },
};

export const sessionManager = {
  set<T>(key: string, data: T): void {
    sessionStorage.setItem(key, JSON.stringify(data));
  },

  get<T>(key: string): T | null {
    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) return null;

    try {
      return JSON.parse(itemStr) as T;
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    sessionStorage.removeItem(key);
  },

  clear(): void {
    sessionStorage.clear();
  },
};