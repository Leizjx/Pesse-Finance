type CacheEntry<T> = {
  value: T;
  expiry: number;
};

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, value: T, ttlMs: number = 300000) { // Default 5 mins
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

// Global instance for serverless reuse within warm lambda
export const globalCache = new SimpleCache();
