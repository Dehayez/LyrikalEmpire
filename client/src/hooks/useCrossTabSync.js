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
  
  console.log('🔄 useCrossTabSync initialized with:', {
    currentBeat: currentBeat?.id,
    isPlaying,
    hasSocket: !!socket,
    hasEmitFunctions: !!(emitAudioPlay && emitAudioPause)
  });

  // Emit play event to other tabs
  const broadcastPlay = useCallback(() => {
    if (currentBeat && !isProcessingRemoteEvent.current) {
      console.log('📡 Broadcasting play event to other tabs for beat:', currentBeat.id);
      emitAudioPlay({
        beatId: currentBeat.id,
        timestamp: Date.now(),
        currentTime: audioCore.getCurrentTime()
      });
    } else if (isProcessingRemoteEvent.current) {
      console.log('⏭️ Skipping broadcast - processing remote event');
    } else {
      console.log('⏭️ Skipping broadcast - no current beat');
    }
  }, [currentBeat, emitAudioPlay, audioCore]);

  // Emit pause event to other tabs
  const broadcastPause = useCallback(() => {
    if (currentBeat && !isProcessingRemoteEvent.current) {
      console.log('📡 Broadcasting pause event to other tabs for beat:', currentBeat.id);
      emitAudioPause({
        beatId: currentBeat.id,
        timestamp: Date.now(),
        currentTime: audioCore.getCurrentTime()
      });
    } else if (isProcessingRemoteEvent.current) {
      console.log('⏭️ Skipping broadcast - processing remote event');
    } else {
      console.log('⏭️ Skipping broadcast - no current beat');
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
      console.log('Current beat:', currentBeat?.id, 'Data beat:', data.beatId);
      console.log('Current isPlaying:', isPlaying, 'Audio paused:', audioCore.isPaused());
      
      if (currentBeat && data.beatId === currentBeat.id) {
        // Check actual audio state rather than React state
        if (audioCore.isPaused()) {
          console.log('🎵 Starting remote play...');
          isProcessingRemoteEvent.current = true;
          setIsPlaying(true);
          audioCore.play().then(() => {
            isProcessingRemoteEvent.current = false;
            console.log('✅ Remote play successful');
          }).catch((error) => {
            isProcessingRemoteEvent.current = false;
            console.warn('❌ Remote play failed:', error);
          });
        } else {
          console.log('🔄 Audio already playing, skipping remote play');
        }
      }
    };

    const handleRemotePause = (data) => {
      console.log('📥 Received pause event from another tab:', data);
      console.log('Current beat:', currentBeat?.id, 'Data beat:', data.beatId);
      console.log('Current isPlaying:', isPlaying, 'Audio paused:', audioCore.isPaused());
      
      if (currentBeat && data.beatId === currentBeat.id) {
        // Check actual audio state rather than React state
        if (!audioCore.isPaused()) {
          console.log('⏸️ Starting remote pause...');
          isProcessingRemoteEvent.current = true;
          setIsPlaying(false);
          audioCore.pause();
          // pause() doesn't return a promise, so clear the flag immediately
          isProcessingRemoteEvent.current = false;
          console.log('✅ Remote pause successful');
        } else {
          console.log('🔄 Audio already paused, skipping remote pause');
        }
      }
    };

    const handleRemoteSeek = (data) => {
      console.log('📥 Received seek event from another tab:', data);
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

  console.log('🔄 useCrossTabSync returning functions:', {
    broadcastPlay: !!broadcastPlay,
    broadcastPause: !!broadcastPause,
    broadcastSeek: !!broadcastSeek,
    broadcastBeatChange: !!broadcastBeatChange
  });

  return {
    broadcastPlay,
    broadcastPause,
    broadcastSeek,
    broadcastBeatChange,
    isProcessingRemoteEvent: () => isProcessingRemoteEvent.current
  };
}; 