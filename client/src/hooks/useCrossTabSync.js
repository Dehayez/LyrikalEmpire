import { useEffect, useCallback } from 'react';
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

  // Emit play event to other tabs
  const broadcastPlay = useCallback(() => {
    if (currentBeat) {
      console.log('📡 Broadcasting play event to other tabs');
      emitAudioPlay({
        beatId: currentBeat.id,
        timestamp: Date.now(),
        currentTime: audioCore.getCurrentTime()
      });
    }
  }, [currentBeat, emitAudioPlay, audioCore]);

  // Emit pause event to other tabs
  const broadcastPause = useCallback(() => {
    if (currentBeat) {
      console.log('📡 Broadcasting pause event to other tabs');
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
      console.log('📡 Broadcasting seek event to other tabs');
      emitAudioSeek({
        beatId: currentBeat.id,
        timestamp: Date.now(),
        currentTime: time
      });
    }
  }, [currentBeat, emitAudioSeek]);

  // Emit beat change event to other tabs
  const broadcastBeatChange = useCallback((beat) => {
    console.log('📡 Broadcasting beat change event to other tabs');
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
      console.log('📥 Received play event from another tab:', data);
      if (currentBeat && data.beatId === currentBeat.id) {
        if (!isPlaying) {
          setIsPlaying(true);
          audioCore.play();
        }
      }
    };

    const handleRemotePause = (data) => {
      console.log('📥 Received pause event from another tab:', data);
      if (currentBeat && data.beatId === currentBeat.id) {
        if (isPlaying) {
          setIsPlaying(false);
          audioCore.pause();
        }
      }
    };

    const handleRemoteSeek = (data) => {
      console.log('📥 Received seek event from another tab:', data);
      if (currentBeat && data.beatId === currentBeat.id) {
        audioCore.setCurrentTime(data.currentTime);
      }
    };

    const handleRemoteBeatChange = (data) => {
      console.log('📥 Received beat change event from another tab:', data);
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
    broadcastBeatChange
  };
}; 