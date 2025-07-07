interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

class Cache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL: number;
  private readonly maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 100;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    // Remove expired items
    this.cleanup();

    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }
}

// Create different cache instances for different use cases
export const apiCache = new Cache({ ttl: 2 * 60 * 1000, maxSize: 50 }); // 2 minutes for API responses
export const dataCache = new Cache({ ttl: 10 * 60 * 1000, maxSize: 100 }); // 10 minutes for data
export const userCache = new Cache({ ttl: 30 * 60 * 1000, maxSize: 20 }); // 30 minutes for user data

// Utility functions for common cache operations
export const cacheUtils = {
  // Generate cache key for API responses
  generateApiKey: (endpoint: string, params?: Record<string, any>): string => {
    const paramString = params ? JSON.stringify(params) : '';
    return `api:${endpoint}:${paramString}`;
  },

  // Generate cache key for user data
  generateUserKey: (userId: string, dataType: string): string => {
    return `user:${userId}:${dataType}`;
  },

  // Generate cache key for data queries
  generateDataKey: (collection: string, userId: string, query?: Record<string, any>): string => {
    const queryString = query ? JSON.stringify(query) : '';
    return `data:${collection}:${userId}:${queryString}`;
  },

  // Invalidate all cache entries for a user
  invalidateUserCache: (userId: string): void => {
    for (const [key] of userCache['cache']) {
      if (key.includes(`user:${userId}:`)) {
        userCache.delete(key);
      }
    }
    for (const [key] of dataCache['cache']) {
      if (key.includes(`data:${userId}:`)) {
        dataCache.delete(key);
      }
    }
  },

  // Invalidate cache entries for a specific data type
  invalidateDataType: (userId: string, dataType: string): void => {
    const userKey = cacheUtils.generateUserKey(userId, dataType);
    userCache.delete(userKey);
    
    for (const [key] of dataCache['cache']) {
      if (key.includes(`data:${dataType}:${userId}`)) {
        dataCache.delete(key);
      }
    }
  }
};

export default Cache; 