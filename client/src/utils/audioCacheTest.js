import { audioCacheService } from '../services';

// Test utility to manually verify cache functionality
export const testAudioCache = async () => {
  console.group('🧪 Testing Audio Cache System');
  
  try {
    // 1. Check if service is initialized
    console.log('1. Service check:', audioCacheService ? '✅ Loaded' : '❌ Not loaded');
    
    // 2. Check IndexedDB availability
    console.log('2. IndexedDB check:', window.indexedDB ? '✅ Available' : '❌ Not available');
    
    // 3. Check if database is initialized
    console.log('3. Database check:', audioCacheService.db ? '✅ Initialized' : '❌ Not initialized');
    
    // 4. Wait for initialization if needed
    if (!audioCacheService.db) {
      console.log('4. Waiting for database initialization...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('4. After wait - Database check:', audioCacheService.db ? '✅ Initialized' : '❌ Still not initialized');
    }
    
    // 5. Test basic cache operations
    try {
      console.log('5. Testing cache operations...');
      
      // Test with a dummy audio file
      const testUserId = 'test_user_123';
      const testFileName = 'test_audio.mp3';
      
      // Check if test file is cached (should be false)
      const isCached = await audioCacheService.isAudioCached(testUserId, testFileName);
      console.log(`   Test file cached: ${isCached ? '✅ Yes' : '❌ No (expected)'}`);
      
      // Test cache key generation
      const cacheKey = audioCacheService.getCacheKey(testUserId, testFileName);
      console.log(`   Cache key: ${cacheKey}`);
      
      // Get cache stats
      const stats = await audioCacheService.getCacheStats();
      console.log('   Cache stats:', stats);
      
    } catch (error) {
      console.error('❌ Cache operations failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Cache test failed:', error);
  }
  
  console.groupEnd();
};

// Make available globally
if (typeof window !== 'undefined') {
  window.testAudioCache = testAudioCache;
  console.log('🧪 Test utility loaded! Run: testAudioCache()');
} 