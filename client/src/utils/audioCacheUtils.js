import { audioCacheService } from '../services';

// Format bytes to human readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Get cache usage percentage
export const getCacheUsagePercentage = (currentSize, maxSize) => {
  return Math.round((currentSize / maxSize) * 100);
};

// Preload audio files for a list of beats
export const preloadBeats = async (beats, maxConcurrent = 3) => {
  if (!beats || beats.length === 0) return;
  
  const preloadPromises = [];
  const results = [];
  
  for (let i = 0; i < beats.length; i += maxConcurrent) {
    const batch = beats.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (beat) => {
      if (!beat.audio || !beat.user_id) return { success: false, beat, error: 'Missing data' };
      
      try {
        // Check if already cached
        const isCached = await audioCacheService.isAudioCached(beat.user_id, beat.audio);
        if (isCached) {
          return { success: true, beat, cached: true };
        }
        
        // Skip preloading if beat is too large (>10MB estimated)
        if (beat.duration && beat.duration > 300) { // 5+ minutes
          return { success: false, beat, error: 'File too large for preloading' };
        }
        
        // This would require importing getSignedUrl - we'll handle this in the component
        return { success: false, beat, error: 'Preloading not implemented here' };
      } catch (error) {
        return { success: false, beat, error: error.message };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map(result => result.status === 'fulfilled' ? result.value : result.reason));
  }
  
  return results;
};

// Clean up expired cache entries
export const cleanupCache = async () => {
  try {
    await audioCacheService.cleanupExpiredEntries();
    return true;
  } catch (error) {
    console.error('Error cleaning up cache:', error);
    return false;
  }
};

// Get detailed cache statistics
export const getCacheStatistics = async () => {
  try {
    const stats = await audioCacheService.getCacheStats();
    
    return {
      ...stats,
      memory: {
        ...stats.memory,
        formatted: formatBytes(stats.memory.size),
        percentage: getCacheUsagePercentage(stats.memory.size, stats.memory.maxSize)
      },
      indexedDB: {
        ...stats.indexedDB,
        formatted: formatBytes(stats.indexedDB.size),
        percentage: getCacheUsagePercentage(stats.indexedDB.size, stats.indexedDB.maxSize)
      },
      total: {
        ...stats.total,
        formatted: formatBytes(stats.total.size)
      }
    };
  } catch (error) {
    console.error('Error getting cache statistics:', error);
    return null;
  }
};

// Check if a beat's audio is cached
export const isBeatCached = async (beat) => {
  if (!beat?.audio || !beat?.user_id) return false;
  
  try {
    return await audioCacheService.isAudioCached(beat.user_id, beat.audio);
  } catch (error) {
    console.error('Error checking if beat is cached:', error);
    return false;
  }
};

// Clear all cached audio
export const clearAllCache = async () => {
  try {
    await audioCacheService.clearCache();
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Initialize cache cleanup on app start
export const initializeCacheCleanup = () => {
  // Clean up expired entries on app start
  setTimeout(() => {
    cleanupCache();
  }, 5000); // Wait 5 seconds after app start
  
  // Set up periodic cleanup (every 6 hours)
  setInterval(() => {
    cleanupCache();
  }, 6 * 60 * 60 * 1000);
};

// Preload queue of beats (useful for playlists)
export const preloadQueue = async (beats, currentIndex = 0, preloadCount = 3) => {
  if (!beats || beats.length === 0) return;
  
  const startIndex = Math.max(0, currentIndex - 1);
  const endIndex = Math.min(beats.length, currentIndex + preloadCount);
  const beatsToPreload = beats.slice(startIndex, endIndex);
  
  const results = await preloadBeats(beatsToPreload, 2);
  return results;
}; 