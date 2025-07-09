import { useEffect, useCallback } from 'react';
import { syncAllPlayers as syncAllPlayersUtil } from '../utils';

export const useAudioSync = ({
  playerRef,
  setCurrentTimeState,
  setDuration,
  setProgress,
  wavesurfer,
  shouldShowMobilePlayer,
  mobilePlayerRef,
  isMobileOrTablet,
  desktopPlayerRef,
  shouldShowFullPagePlayer,
  isFullPageVisible,
  fullPageProgressRef,
  onNext,
  setIsPlaying,
  repeat
}) => {
  // Sync all players with main audio element
  const syncAllPlayers = useCallback((forceUpdate = false) => {
    syncAllPlayersUtil({
      playerRef,
      setCurrentTimeState,
      setDuration,
      setProgress,
      wavesurfer,
      shouldShowMobilePlayer,
      mobilePlayerRef,
      isMobileOrTablet,
      desktopPlayerRef,
      shouldShowFullPagePlayer,
      isFullPageVisible,
      fullPageProgressRef,
      forceUpdate
    });
  }, [
    playerRef,
    setCurrentTimeState,
    setDuration,
    setProgress,
    wavesurfer,
    shouldShowMobilePlayer,
    mobilePlayerRef,
    isMobileOrTablet,
    desktopPlayerRef,
    shouldShowFullPagePlayer,
    isFullPageVisible,
    fullPageProgressRef
  ]);

  // Handle seeking from display players
  const handleSeeked = useCallback((e) => {
    const mainAudio = playerRef.current?.audio.current;
    const newTime = e.target.currentTime;
    
    if (mainAudio && Math.abs(mainAudio.currentTime - newTime) > 0.1) {
      mainAudio.currentTime = newTime;
      syncAllPlayers();
    }
  }, [playerRef, syncAllPlayers]);

  // Override H5AudioPlayer events to prevent conflicts
  const preventDefaultAudioEvents = {
    onPlay: (e) => {
      e.preventDefault();
      handlePlayPause(true);
    },
    onPause: (e) => {
      e.preventDefault();
      handlePlayPause(false);
    },
    onLoadStart: () => {},
    onCanPlay: () => {},
    onLoadedData: () => {},
    onSeeked: handleSeeked,
  };

  // Handle play/pause from UI
  const handlePlayPause = useCallback((play) => {
    const audio = playerRef.current?.audio.current;
    if (audio) {
      if (play) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    }
  }, [playerRef]);

  // Handle when song ends - trigger next track or repeat
  const handleEnded = useCallback(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      if (repeat === 'Repeat One') {
        audioElement.currentTime = 0;
        audioElement.play();
      } else {
        onNext();
      }
    }
  }, [onNext, repeat, playerRef]);

  // Set up main audio player event listeners
  useEffect(() => {
    const mainAudio = playerRef.current?.audio.current;
    if (!mainAudio) return;

    const handleTimeUpdate = () => {
      syncAllPlayers();
    };

    const handleLoadedMetadata = () => {
      // Wait a bit for the audio to be ready, then sync
      setTimeout(() => syncAllPlayers(true), 100);
    };

    const handleLoadedData = () => {
      syncAllPlayers(true);
    };

    const handleCanPlay = () => {
      syncAllPlayers(true);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    mainAudio.addEventListener('timeupdate', handleTimeUpdate);
    mainAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
    mainAudio.addEventListener('loadeddata', handleLoadedData);
    mainAudio.addEventListener('canplay', handleCanPlay);
    mainAudio.addEventListener('play', handlePlay);
    mainAudio.addEventListener('pause', handlePause);
    mainAudio.addEventListener('ended', handleEnded);
    
    // Initial sync - force update even when paused
    const initialSync = () => {
      if (mainAudio.readyState >= 1) {
        syncAllPlayers(true);
      }
    };
    
    initialSync();
    
    // Also try after a short delay in case metadata isn't loaded yet
    const timeoutId = setTimeout(initialSync, 200);

    return () => {
      clearTimeout(timeoutId);
      mainAudio.removeEventListener('timeupdate', handleTimeUpdate);
      mainAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      mainAudio.removeEventListener('loadeddata', handleLoadedData);
      mainAudio.removeEventListener('canplay', handleCanPlay);
      mainAudio.removeEventListener('play', handlePlay);
      mainAudio.removeEventListener('pause', handlePause);
      mainAudio.removeEventListener('ended', handleEnded);
    };
      }, [playerRef.current?.audio.current, onNext, setIsPlaying, syncAllPlayers, handleEnded]);

  // Effect to sync display players when they're rendered or view changes
  useEffect(() => {
    const syncAfterRender = () => {
      // Immediate sync without delay for view changes
      syncAllPlayers(true);
      
      // Also force sync with requestAnimationFrame for next paint cycle
      requestAnimationFrame(() => {
        syncAllPlayers(true);
      });
    };
    
    // Immediate sync when switching views
    syncAfterRender();
    
    return () => {};
  }, [shouldShowFullPagePlayer, shouldShowMobilePlayer, isFullPageVisible, syncAllPlayers]);

  // Additional effect to ensure sync after display players are mounted
  useEffect(() => {
    const ensureSync = () => {
      const mainAudio = playerRef.current?.audio.current;
      if (mainAudio && (mainAudio.readyState >= 1 || mainAudio.duration)) {
        syncAllPlayers(true);
      }
    };

    // Immediate sync, then fallback syncs
    ensureSync();
    
    // Reduced timeout intervals for faster sync
    const intervals = [0, 16, 50]; // 0ms, one frame, then 50ms
    const timeouts = intervals.map(delay => 
      setTimeout(ensureSync, delay)
    );

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [playerRef, syncAllPlayers]);

  return {
    syncAllPlayers,
    handleSeeked,
    preventDefaultAudioEvents,
    handlePlayPause
  };
}; 