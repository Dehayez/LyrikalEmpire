import { audioCacheService, getSignedUrl } from '../services';

// Debug utilities for checking audio cache status
class AudioCacheDebug {
  // Get comprehensive cache statistics
  static async getStats() {
    try {
      const stats = await audioCacheService.getCacheStats();
      console.group('🎵 Audio Cache Statistics');
      
      console.log('📊 Memory Cache:');
      console.log(`  Size: ${AudioCacheDebug.formatBytes(stats.memory.size)} / ${AudioCacheDebug.formatBytes(stats.memory.maxSize)} (${Math.round((stats.memory.size / stats.memory.maxSize) * 100)}%)`);
      console.log(`  Files: ${stats.memory.count}`);
      
      console.log('\n💾 IndexedDB Cache:');
      console.log(`  Size: ${AudioCacheDebug.formatBytes(stats.indexedDB.size)} / ${AudioCacheDebug.formatBytes(stats.indexedDB.maxSize)} (${Math.round((stats.indexedDB.size / stats.indexedDB.maxSize) * 100)}%)`);
      console.log(`  Files: ${stats.indexedDB.count}`);
      
      console.log('\n📈 Total:');
      console.log(`  Size: ${AudioCacheDebug.formatBytes(stats.total.size)}`);
      console.log(`  Files: ${stats.total.count}`);
      
      console.groupEnd();
      return stats;
    } catch (error) {
      console.error('❌ Error getting cache stats:', error);
      return null;
    }
  }

  // Check if specific track is cached
  static async isTrackCached(userId, fileName) {
    try {
      const isCached = await audioCacheService.isAudioCached(userId, fileName);
      const cacheKey = audioCacheService.getCacheKey(userId, fileName);
      
      console.log(`🎵 Track Cache Status:`);
      console.log(`  File: ${fileName}`);
      console.log(`  User ID: ${userId}`);
      console.log(`  Cache Key: ${cacheKey}`);
      console.log(`  Cached: ${isCached ? '✅ Yes' : '❌ No'}`);
      
      return isCached;
    } catch (error) {
      console.error('❌ Error checking track cache:', error);
      return false;
    }
  }

  // List all cached tracks
  static async listCachedTracks() {
    try {
      if (!audioCacheService.db) {
        console.warn('⚠️ IndexedDB not available');
        return [];
      }

      const entries = await audioCacheService.db.getAll(audioCacheService.storeName);
      
      console.group('📋 Cached Tracks');
      console.log(`Found ${entries.length} cached tracks:`);
      
      entries.forEach((entry, index) => {
        const [userId, fileName] = entry.id.split('_');
        const sizeFormatted = AudioCacheDebug.formatBytes(entry.size);
        const lastAccessed = new Date(entry.lastAccessed).toLocaleString();
        
        console.log(`${index + 1}. ${fileName}`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Size: ${sizeFormatted}`);
        console.log(`   Last Accessed: ${lastAccessed}`);
        console.log('');
      });
      
      console.groupEnd();
      return entries;
    } catch (error) {
      console.error('❌ Error listing cached tracks:', error);
      return [];
    }
  }

  // Clear all cache with confirmation
  static async clearCache() {
    const confirmed = window.confirm('🗑️ Are you sure you want to clear all cached audio files?');
    if (!confirmed) {
      console.log('❌ Cache clear cancelled');
      return false;
    }

    try {
      await audioCacheService.clearCache();
      console.log('✅ Audio cache cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      return false;
    }
  }

  // Get cache info for current playing track
  static async getCurrentTrackCache() {
    try {
      // Try to get current beat from localStorage or global state
      const currentBeat = JSON.parse(localStorage.getItem('currentBeat') || 'null');
      
      if (!currentBeat || !currentBeat.audio || !currentBeat.user_id) {
        console.warn('⚠️ No current track found');
        return null;
      }

      console.log('🎵 Current Track Cache Info:');
      console.log(`  Title: ${currentBeat.title}`);
      console.log(`  File: ${currentBeat.audio}`);
      
      return await AudioCacheDebug.isTrackCached(currentBeat.user_id, currentBeat.audio);
    } catch (error) {
      console.error('❌ Error getting current track cache:', error);
      return null;
    }
  }

  // Format bytes helper
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Cleanup expired entries manually
  static async cleanupExpired() {
    try {
      await audioCacheService.cleanupExpiredEntries();
      console.log('✅ Expired cache entries cleaned up');
      return true;
    } catch (error) {
      console.error('❌ Error cleaning up expired entries:', error);
      return false;
    }
  }
}

// Manual audio loading test
const testAudioLoading = async (userId, fileName) => {
  try {
    console.group('🧪 Manual Audio Loading Test');
    console.log('User ID:', userId);
    console.log('File Name:', fileName);
    
    // Step 1: Get signed URL
    console.log('📡 Getting signed URL...');
    const signedUrl = await getSignedUrl(userId, fileName);
    console.log('✅ Signed URL:', signedUrl);
    
    // Step 2: Test direct fetch
    console.log('📥 Testing direct fetch...');
    const response = await fetch(signedUrl, { method: 'HEAD' });
    console.log('✅ Fetch response:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Step 3: Test audio element loading
    console.log('🎵 Testing audio element...');
    const audio = new Audio();
    
    const loadPromise = new Promise((resolve, reject) => {
      audio.oncanplaythrough = () => {
        console.log('✅ Audio can play through');
        resolve();
      };
      audio.onerror = (e) => {
        console.log('❌ Audio error:', e);
        console.log('Error details:', audio.error);
        reject(audio.error);
      };
      audio.onloadedmetadata = () => {
        console.log('✅ Audio metadata loaded');
        console.log('Duration:', audio.duration);
      };
    });
    
    audio.src = signedUrl;
    await loadPromise;
    
    console.log('✅ Audio loading test completed successfully');
    console.groupEnd();
    
    return true;
  } catch (error) {
    console.log('❌ Audio loading test failed:', error);
    console.groupEnd();
    return false;
  }
};

// Make debug utilities available globally for console access
if (typeof window !== 'undefined') {
  window.audioCacheDebug = {
    getStats: AudioCacheDebug.getStats,
    getCurrentTrackCache: AudioCacheDebug.getCurrentTrackCache,
    isTrackCached: AudioCacheDebug.isTrackCached,
    listCachedTracks: AudioCacheDebug.listCachedTracks,
    clearCache: AudioCacheDebug.clearCache,
    cleanupExpired: AudioCacheDebug.cleanupExpired,
    testAudioLoading: testAudioLoading
  };
  
  // Show quick help
  console.log(`
🎵 Audio Cache Debug Utilities Available:
  
  audioCacheDebug.getStats()           - Show cache statistics
  audioCacheDebug.getCurrentTrackCache() - Check current track cache status
  audioCacheDebug.isTrackCached(userId, fileName) - Check specific track
  audioCacheDebug.listCachedTracks()   - List all cached tracks
  audioCacheDebug.clearCache()         - Clear all cached audio
  audioCacheDebug.cleanupExpired()     - Clean up expired entries
  audioCacheDebug.testAudioLoading(userId, fileName) - Manually test audio loading
  
Type any command in the console to use!
  `);
}

export default AudioCacheDebug; 