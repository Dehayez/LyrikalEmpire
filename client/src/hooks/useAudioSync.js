import { useEffect, useCallback } from 'react';
import { syncAllPlayers as syncAllPlayersUtil } from '../utils';
import { useCrossTabSync } from './useCrossTabSync';

export const useAudioSync = ({
  audioCore,
  audioInteractions,
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
  repeat,
  currentBeat,
  isPlaying,
  setCurrentBeat
}) => {
  // Cross-tab synchronization
  const { broadcastPlay, broadcastPause, broadcastSeek, broadcastBeatChange } = useCrossTabSync({
    currentBeat,
    isPlaying,
    audioCore,
    setIsPlaying,
    setCurrentBeat,
    currentTime: audioCore.getCurrentTime()
  });
  // Sync all players with main audio element
  const syncAllPlayers = useCallback((forceUpdate = false) => {
    syncAllPlayersUtil({
      playerRef: audioCore.playerRef,
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
    audioCore.playerRef,
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
    const newTime = e.target.currentTime;
    const currentTime = audioCore.getCurrentTime();
    
    if (Math.abs(currentTime - newTime) > 0.1) {
      audioCore.setCurrentTime(newTime);
      syncAllPlayers();
    }
  }, [audioCore, syncAllPlayers]);

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
    audioCore.togglePlayPause(play);
  }, [audioCore]);

  // Handle when song ends - trigger next track or repeat
  const handleEnded = useCallback(() => {
    if (repeat === 'Repeat One') {
      audioCore.setCurrentTime(0);
      audioCore.play();
    } else {
      onNext();
    }
  }, [onNext, repeat, audioCore]);

  // Set up main audio player event listeners
  useEffect(() => {
    const mainAudio = audioCore.playerRef.current?.audio.current;
    if (!mainAudio) return;

    const handleTimeUpdate = () => {
      // Update interaction state with current time
      audioInteractions.updateCurrentTime(audioCore.getCurrentTime());
      syncAllPlayers();
    };

    const handleLoadedMetadata = () => {
      // Wait a bit for the audio to be ready, then sync
      setTimeout(() => syncAllPlayers(true), 100);
    };

    const handleLoadedData = () => {
      syncAllPlayers(true);
      
      // Check if we should start playback now that the correct audio data is loaded
      if (currentBeat?.audio && isPlaying) {
        const currentSrc = mainAudio.src;
        const expectedAudioFileName = currentBeat.audio;
        const srcMatchesBeat = currentSrc && expectedAudioFileName && 
          currentSrc.includes(expectedAudioFileName);
        
        if (srcMatchesBeat && audioCore.isPaused()) {
          console.log('Audio data loaded, starting playback...');
          audioCore.play().catch(error => {
            if (error.name !== 'AbortError') {
              console.warn('Audio play failed after data loaded:', error);
            }
          });
        }
      }
    };

    const handleCanPlay = () => {
      syncAllPlayers(true);
      
      // Check if we should start playback now that the correct audio is ready
      if (currentBeat?.audio && isPlaying) {
        const currentSrc = mainAudio.src;
        const expectedAudioFileName = currentBeat.audio;
        const srcMatchesBeat = currentSrc && expectedAudioFileName && 
          currentSrc.includes(expectedAudioFileName);
        
        if (srcMatchesBeat && audioCore.isPaused()) {
          console.log('Audio src ready, starting playback...');
          audioCore.play().catch(error => {
            if (error.name !== 'AbortError') {
              console.warn('Audio play failed after src ready:', error);
            }
          });
        }
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
      // Broadcast to other tabs
      broadcastPlay();
    };

    const handlePause = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      // Broadcast to other tabs
      broadcastPause();
    };

    const handleVolumeChange = () => {
      // Sync volume changes back to interactions
      const newVolume = mainAudio.volume;
      if (Math.abs(newVolume - audioInteractions.volume) > 0.01) {
        audioInteractions.setVolume(newVolume);
      }
    };

    // Add all event listeners
    mainAudio.addEventListener('timeupdate', handleTimeUpdate);
    mainAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
    mainAudio.addEventListener('loadeddata', handleLoadedData);
    mainAudio.addEventListener('canplay', handleCanPlay);
    mainAudio.addEventListener('play', handlePlay);
    mainAudio.addEventListener('pause', handlePause);
    mainAudio.addEventListener('ended', handleEnded);
    mainAudio.addEventListener('volumechange', handleVolumeChange);
    
    // Initial sync - force update even when paused
    const initialSync = () => {
      if (audioCore.getReadyState() >= 1) {
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
      mainAudio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [audioCore.playerRef.current?.audio.current, audioCore, audioInteractions, setIsPlaying, syncAllPlayers, handleEnded, currentBeat, isPlaying]);

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
      if (audioCore.isReady() || audioCore.getDuration()) {
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
  }, [audioCore, syncAllPlayers]);

  // Apply current beat and playing state to auto-manage audio lifecycle
  useEffect(() => {
    const audio = audioCore.playerRef.current?.audio?.current;
    if (!audio) return;

    // Add a small delay to prevent race conditions during initialization
    const timeoutId = setTimeout(() => {
      if (currentBeat?.audio && isPlaying && audioCore.isReady()) {
        // CRITICAL: Only play if the audio src matches the current beat
        // This prevents playing the wrong track during src changes
        const currentSrc = audio.src;
        const expectedAudioFileName = currentBeat.audio;
        
        // Check if the current audio source contains the expected filename
        const srcMatchesBeat = currentSrc && expectedAudioFileName && 
          currentSrc.includes(expectedAudioFileName);
        
        if (srcMatchesBeat && audioCore.isPaused()) {
          audioCore.play().catch(error => {
            // Ignore AbortError - it's usually from rapid play/pause calls
            if (error.name !== 'AbortError') {
              console.warn('Audio play failed:', error);
            }
          });
        } else if (!srcMatchesBeat) {
          // Audio src doesn't match - wait for it to update
          console.log('Waiting for audio src to update before playing...');
        }
      } else if (!isPlaying && !audioCore.isPaused()) {
        // Always allow pausing regardless of src
        audioCore.pause();
      }
    }, 100); // 100ms delay to let initialization settle

    return () => clearTimeout(timeoutId);
  }, [currentBeat, isPlaying, audioCore]);



  return {
    syncAllPlayers,
    handleSeeked,
    preventDefaultAudioEvents,
    handlePlayPause
  };
}; 