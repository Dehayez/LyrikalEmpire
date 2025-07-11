// Fallback for environments without IndexedDB
let idb;
try {
  idb = require('idb');
} catch (error) {
  console.warn('IndexedDB not available, audio caching will use memory only');
  idb = null;
}

class AudioCacheService {
  constructor() {
    this.db = null;
    this.memoryCache = new Map();
    this.maxMemorySize = 50 * 1024 * 1024; // 50MB memory cache
    this.maxDbSize = 200 * 1024 * 1024; // 200MB IndexedDB cache
    this.currentMemorySize = 0;
    this.dbName = 'LyrikalAudioCache';
    this.version = 1;
    this.storeName = 'audioFiles';
    
    this.init();
  }

  async init() {
    if (!idb) {
      console.warn('IndexedDB not available, using memory cache only');
      return;
    }
    
    try {
      this.db = await idb.openDB(this.dbName, this.version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('audioFiles')) {
            const store = db.createObjectStore('audioFiles', { keyPath: 'id' });
            store.createIndex('lastAccessed', 'lastAccessed');
            store.createIndex('size', 'size');
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize audio cache:', error);
    }
  }

  // Generate cache key from beat info
  getCacheKey(userId, fileName) {
    return `${userId}_${fileName}`;
  }

  // Get audio from cache (memory first, then IndexedDB)
  async getAudio(userId, fileName) {
    const cacheKey = this.getCacheKey(userId, fileName);
    
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(cacheKey);
    if (memoryEntry) {
      memoryEntry.lastAccessed = Date.now();
      return memoryEntry.objectUrl;
    }

    // Check IndexedDB
    if (this.db) {
      try {
        const entry = await this.db.get(this.storeName, cacheKey);
        if (entry) {
          // Update last accessed time
          entry.lastAccessed = Date.now();
          await this.db.put(this.storeName, entry);
          
          // Create object URL and add to memory cache
          const objectUrl = URL.createObjectURL(entry.blob);
          this.addToMemoryCache(cacheKey, objectUrl, entry.blob.size);
          
          return objectUrl;
        }
      } catch (error) {
        console.error('Error reading from audio cache:', error);
      }
    }

    return null;
  }

  // Store audio in cache
  async storeAudio(userId, fileName, audioBlob) {
    const cacheKey = this.getCacheKey(userId, fileName);
    const now = Date.now();
    
    try {
      // Store in IndexedDB
      if (this.db) {
        const entry = {
          id: cacheKey,
          blob: audioBlob,
          size: audioBlob.size,
          lastAccessed: now,
          created: now
        };
        
        // Check if we need to cleanup space
        await this.ensureDbSpace(audioBlob.size);
        await this.db.put(this.storeName, entry);
      }

      // Create object URL and add to memory cache
      const objectUrl = URL.createObjectURL(audioBlob);
      this.addToMemoryCache(cacheKey, objectUrl, audioBlob.size);
      
      return objectUrl;
    } catch (error) {
      console.error('Error storing audio in cache:', error);
      throw error;
    }
  }

  // Add to memory cache with size management
  addToMemoryCache(key, objectUrl, size) {
    // Clean up existing entry if present
    if (this.memoryCache.has(key)) {
      const existing = this.memoryCache.get(key);
      URL.revokeObjectURL(existing.objectUrl);
      this.currentMemorySize -= existing.size;
    }

    // Ensure we have space
    this.ensureMemorySpace(size);

    // Add new entry
    this.memoryCache.set(key, {
      objectUrl,
      size,
      lastAccessed: Date.now()
    });
    this.currentMemorySize += size;
  }

  // Ensure memory cache has space
  ensureMemorySpace(requiredSize) {
    while (this.currentMemorySize + requiredSize > this.maxMemorySize && this.memoryCache.size > 0) {
      // Remove least recently used item
      let oldestKey = null;
      let oldestTime = Date.now();
      
      for (const [key, entry] of this.memoryCache) {
        if (entry.lastAccessed < oldestTime) {
          oldestTime = entry.lastAccessed;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        const entry = this.memoryCache.get(oldestKey);
        URL.revokeObjectURL(entry.objectUrl);
        this.currentMemorySize -= entry.size;
        this.memoryCache.delete(oldestKey);
      }
    }
  }

  // Ensure IndexedDB has space
  async ensureDbSpace(requiredSize) {
    if (!this.db) return;

    try {
      const currentSize = await this.getDbSize();
      if (currentSize + requiredSize > this.maxDbSize) {
        // Remove oldest entries until we have space
        const oldEntries = await this.db.getAllFromIndex(this.storeName, 'lastAccessed');
        
        for (const entry of oldEntries) {
          await this.db.delete(this.storeName, entry.id);
          if (await this.getDbSize() + requiredSize <= this.maxDbSize) {
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error managing IndexedDB space:', error);
    }
  }

  // Get current IndexedDB size
  async getDbSize() {
    if (!this.db) return 0;

    try {
      const entries = await this.db.getAll(this.storeName);
      return entries.reduce((total, entry) => total + entry.size, 0);
    } catch (error) {
      console.error('Error calculating DB size:', error);
      return 0;
    }
  }

  // Check if audio is cached
  async isAudioCached(userId, fileName) {
    const cacheKey = this.getCacheKey(userId, fileName);
    
    // Check memory cache
    if (this.memoryCache.has(cacheKey)) {
      return true;
    }

    // Check IndexedDB
    if (this.db) {
      try {
        const entry = await this.db.get(this.storeName, cacheKey);
        return !!entry;
      } catch (error) {
        console.error('Error checking cache:', error);
      }
    }

    return false;
  }

  // Clear all cached audio
  async clearCache() {
    // Clear memory cache
    for (const [key, entry] of this.memoryCache) {
      URL.revokeObjectURL(entry.objectUrl);
    }
    this.memoryCache.clear();
    this.currentMemorySize = 0;

    // Clear IndexedDB
    if (this.db) {
      try {
        await this.db.clear(this.storeName);
      } catch (error) {
        console.error('Error clearing IndexedDB cache:', error);
      }
    }
  }

  // Get cache statistics
  async getCacheStats() {
    const memoryStats = {
      size: this.currentMemorySize,
      count: this.memoryCache.size,
      maxSize: this.maxMemorySize
    };

    let dbStats = {
      size: 0,
      count: 0,
      maxSize: this.maxDbSize
    };

    if (this.db) {
      try {
        const entries = await this.db.getAll(this.storeName);
        dbStats.count = entries.length;
        dbStats.size = entries.reduce((total, entry) => total + entry.size, 0);
      } catch (error) {
        console.error('Error getting DB stats:', error);
      }
    }

    return {
      memory: memoryStats,
      indexedDB: dbStats,
      total: {
        size: memoryStats.size + dbStats.size,
        count: memoryStats.count + dbStats.count
      }
    };
  }

  // Clean up expired entries (older than 7 days)
  async cleanupExpiredEntries() {
    if (!this.db) return;

    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    try {
      const entries = await this.db.getAll(this.storeName);
      const expiredEntries = entries.filter(entry => entry.lastAccessed < sevenDaysAgo);
      
      for (const entry of expiredEntries) {
        await this.db.delete(this.storeName, entry.id);
        
        // Also remove from memory cache if present
        if (this.memoryCache.has(entry.id)) {
          const memoryEntry = this.memoryCache.get(entry.id);
          URL.revokeObjectURL(memoryEntry.objectUrl);
          this.currentMemorySize -= memoryEntry.size;
          this.memoryCache.delete(entry.id);
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired entries:', error);
    }
  }

  // Preload audio for a beat
  async preloadAudio(userId, fileName, signedUrl) {
    const cacheKey = this.getCacheKey(userId, fileName);
    
    // Check if already cached
    if (await this.isAudioCached(userId, fileName)) {
      return await this.getAudio(userId, fileName);
    }

    try {
      // Fetch audio blob
      const response = await fetch(signedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      
      const audioBlob = await response.blob();
      return await this.storeAudio(userId, fileName, audioBlob);
    } catch (error) {
      console.error('Error preloading audio:', error);
      throw error;
    }
  }

  // Cleanup resources
  destroy() {
    // Clean up memory cache
    for (const [key, entry] of this.memoryCache) {
      URL.revokeObjectURL(entry.objectUrl);
    }
    this.memoryCache.clear();
    this.currentMemorySize = 0;

    // Close database
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Create singleton instance
const audioCacheService = new AudioCacheService();

export default audioCacheService; 