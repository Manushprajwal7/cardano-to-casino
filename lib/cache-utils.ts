// Cache utility with support for both in-memory and Redis caching
// For production, you would integrate with Redis

interface CacheEntry {
  data: any;
  timestamp: number;
}

class CacheManager {
  private inMemoryCache: Map<string, CacheEntry>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 30000) {
    this.inMemoryCache = new Map<string, CacheEntry>();
    this.defaultTTL = defaultTTL;
  }

  // Get data from cache if it exists and is not expired
  get(key: string): any | null {
    const entry = this.inMemoryCache.get(key);

    if (!entry) {
      console.log(`Cache miss for key: ${key} - no entry found`);
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.defaultTTL) {
      console.log(`Cache miss for key: ${key} - entry expired`);
      this.inMemoryCache.delete(key);
      return null;
    }

    console.log(`Cache hit for key: ${key}`);
    return entry.data;
  }

  // Set data in cache with current timestamp
  set(key: string, data: any): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };
    this.inMemoryCache.set(key, entry);
    console.log(`Cache set for key: ${key}`);
  }

  // Delete a specific key from cache
  delete(key: string): void {
    this.inMemoryCache.delete(key);
    console.log(`Cache deleted for key: ${key}`);
  }

  // Clear all cache entries
  clear(): void {
    this.inMemoryCache.clear();
    console.log("Cache cleared");
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.inMemoryCache.size,
      keys: Array.from(this.inMemoryCache.keys()),
    };
  }
}

// Export a singleton instance with default TTL of 30 seconds
export const cacheManager = new CacheManager(30000);

// Export the class for creating instances with different TTLs
export default CacheManager;
