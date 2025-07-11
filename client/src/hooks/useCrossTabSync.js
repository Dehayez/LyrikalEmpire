import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '../contexts';

export const useCrossTabSync = ({
  currentBeat,
  isPlaying,
  audioCore,
  setIsPlaying,
  setCurrentBeat,
  currentTime
}) => {
  const { socket, emitAudioPlay, emitAudioPause, emitAudioSeek, emitBeatChange } = useWebSocket();
  const isProcessingRemoteEvent = useRef(false);

  // Emit play event to other tabs
  const broadcastPlay = useCallback(() => {
    if (currentBeat && !isProcessingRemoteEvent.current) {
      emitAudioPlay({
        beatId: currentBeat.id,
        timestamp: Date.now(),
        currentTime: audioCore.getCurrentTime()
      });
    }
  }, [currentBeat, emitAudioPlay, audioCore]);

  // Emit pause event to other tabs
  const broadcastPause = useCallback(() => {
    if (currentBeat && !isProcessingRemoteEvent.current) {
      emitAudioPause({
        beatId: currentBeat.id,
        timestamp: Date.now(),
        currentTime: audioCore.getCurrentTime()
      });
    }
  }, [currentBeat, emitAudioPause, audioCore]);

  // Emit seek event to other tabs
  const broadcastSeek = useCallback((time) => {
    if (currentBeat) {
      emitAudioSeek({
        beatId: currentBeat.id,
        timestamp: Date.now(),
        currentTime: time
      });
    }
  }, [currentBeat, emitAudioSeek]);

  // Emit beat change event to other tabs
  const broadcastBeatChange = useCallback((beat) => {
    emitBeatChange({
      beatId: beat.id,
      timestamp: Date.now(),
      beat: beat
    });
  }, [emitBeatChange]);

  // Listen for events from other tabs
  useEffect(() => {
    if (!socket) return;

    const handleRemotePlay = (data) => {
      if (currentBeat && data.beatId === currentBeat.id) {
        // Check actual audio state rather than React state
        if (audioCore.isPaused()) {
          isProcessingRemoteEvent.current = true;
          setIsPlaying(true);
          audioCore.play().then(() => {
            isProcessingRemoteEvent.current = false;
          }).catch((error) => {
            isProcessingRemoteEvent.current = false;
          });
        }
      }
    };

    const handleRemotePause = (data) => {
      if (currentBeat && data.beatId === currentBeat.id) {
        // Check actual audio state rather than React state
        if (!audioCore.isPaused()) {
          isProcessingRemoteEvent.current = true;
          setIsPlaying(false);
          audioCore.pause();
          // pause() doesn't return a promise, so clear the flag immediately
          isProcessingRemoteEvent.current = false;
        }
      }
    };

    const handleRemoteSeek = (data) => {
      if (currentBeat && data.beatId === currentBeat.id) {
        isProcessingRemoteEvent.current = true;
        audioCore.setCurrentTime(data.currentTime);
        // Clear the flag after a short delay to avoid interfering with seek events
        setTimeout(() => {
          isProcessingRemoteEvent.current = false;
        }, 100);
      }
    };

    const handleRemoteBeatChange = (data) => {
      // Only update if it's a different beat
      if (!currentBeat || currentBeat.id !== data.beatId) {
        setCurrentBeat(data.beat);
      }
    };

    socket.on('audio-play', handleRemotePlay);
    socket.on('audio-pause', handleRemotePause);
    socket.on('audio-seek', handleRemoteSeek);
    socket.on('beat-change', handleRemoteBeatChange);

    return () => {
      socket.off('audio-play', handleRemotePlay);
      socket.off('audio-pause', handleRemotePause);
      socket.off('audio-seek', handleRemoteSeek);
      socket.off('beat-change', handleRemoteBeatChange);
    };
  }, [socket, currentBeat, isPlaying, audioCore, setIsPlaying, setCurrentBeat]);

  return {
    broadcastPlay,
    broadcastPause,
    broadcastSeek,
    broadcastBeatChange,
    isProcessingRemoteEvent: () => isProcessingRemoteEvent.current
  };
}; 