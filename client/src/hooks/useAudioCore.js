import { useCallback, useRef } from 'react';

export const useAudioCore = () => {
  const playerRef = useRef();

  // Core audio control functions
  const play = useCallback(() => {
    const audio = playerRef.current?.audio?.current;
    console.log('🎮 play() called, audio state:', {
      exists: !!audio,
      paused: audio?.paused,
      readyState: audio?.readyState
    });
    
    if (audio && audio.paused && audio.readyState >= 2) {
      console.log('▶️ Executing audio.play()');
      return audio.play().catch(error => {
        // Only log non-AbortError issues
        if (error.name !== 'AbortError') {
          console.error('Audio play failed:', error);
        }
        throw error;
      });
    }
    
    console.log('⏭️ Skipping audio.play() - conditions not met');
    return Promise.resolve();
  }, []);

  const pause = useCallback(() => {
    const audio = playerRef.current?.audio?.current;
    console.log('🎮 pause() called, audio state:', {
      exists: !!audio,
      paused: audio?.paused
    });
    
    if (audio && !audio.paused) {
      console.log('⏸️ Executing audio.pause()');
      try {
        audio.pause();
      } catch (error) {
        // Ignore errors during pause - they're usually harmless
        console.warn('Audio pause failed:', error);
      }
    } else {
      console.log('⏭️ Skipping audio.pause() - conditions not met');
    }
  }, []);

  const togglePlayPause = useCallback((shouldPlay) => {
    const audio = playerRef.current?.audio?.current;
    if (!audio) {
      console.log('🚫 togglePlayPause: No audio element found');
      return Promise.resolve();
    }

    // Check current state to avoid unnecessary calls
    const isCurrentlyPaused = audio.paused;
    
    console.log('🎯 togglePlayPause called:', {
      shouldPlay,
      isCurrentlyPaused,
      readyState: audio.readyState
    });
    
    if (shouldPlay && isCurrentlyPaused) {
      console.log('▶️ togglePlayPause: Starting play');
      return play();
    } else if (!shouldPlay && !isCurrentlyPaused) {
      console.log('⏸️ togglePlayPause: Starting pause');
      pause();
      return Promise.resolve();
    }
    
    // Already in the desired state
    console.log('🔄 togglePlayPause: Already in desired state');
    return Promise.resolve();
  }, [play, pause]);

  const setVolume = useCallback((volume) => {
    const audio = playerRef.current?.audio?.current;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const setCurrentTime = useCallback((time) => {
    const audio = playerRef.current?.audio?.current;
    if (audio && !isNaN(time)) {
      audio.currentTime = time;
    }
  }, []);

  const getCurrentTime = useCallback(() => {
    const audio = playerRef.current?.audio?.current;
    return audio?.currentTime || 0;
  }, []);

  const getDuration = useCallback(() => {
    const audio = playerRef.current?.audio?.current;
    return audio?.duration || 0;
  }, []);

  const getReadyState = useCallback(() => {
    const audio = playerRef.current?.audio?.current;
    return audio?.readyState || 0;
  }, []);

  const isEnded = useCallback(() => {
    const audio = playerRef.current?.audio?.current;
    return audio?.ended || false;
  }, []);

  const isPaused = useCallback(() => {
    const audio = playerRef.current?.audio?.current;
    return audio?.paused ?? true;
  }, []);

  // Helper to check if audio element exists and is ready
  const isReady = useCallback(() => {
    const audio = playerRef.current?.audio?.current;
    return audio && audio.readyState >= 1;
  }, []);

  return {
    playerRef,
    // Core controls
    play,
    pause,
    togglePlayPause,
    setVolume,
    setCurrentTime,
    // State getters
    getCurrentTime,
    getDuration,
    getReadyState,
    isEnded,
    isPaused,
    isReady
  };
}; 