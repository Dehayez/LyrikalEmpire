import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocalStorageSync } from './useLocalStorageSync';

export const useAudioPlayer = ({ currentBeat, setCurrentBeat, isPlaying, setIsPlaying, onNext, onPrev, shuffle, setShuffle, repeat, setRepeat }) => {
  const playerRef = useRef();
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('volume');
    return savedVolume !== null ? parseFloat(savedVolume) : 1.0;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragPosition, setDragPosition] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => {
    const savedCurrentTime = localStorage.getItem('currentTime');
    return savedCurrentTime !== null ? parseFloat(savedCurrentTime) : 0;
  });

  useLocalStorageSync({
    shuffle,
    repeat,
    currentBeat,
    volume,
    currentTime,
  });

  const handleVolumeChange = e => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('volume', newVolume.toString());
  };

  const handlePlayPause = useCallback(play => {
    const audio = playerRef.current?.audio?.current;
    if (audio) {
      if (play && audio.paused) {
        audio.play().catch(() => {});
      } else if (!play && !audio.paused) {
        audio.pause();
      }
    }
  }, []);

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
  }, [onNext, repeat]);

  const handleTouchStart = e => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = e => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const currentPosition = touch.clientX;
    const movementX = currentPosition - startX;
    setDragPosition(movementX);
    e.preventDefault();
  };

  const handleTouchEnd = e => {
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    setIsDragging(false);
    setDragPosition(0);

    if (startX - endX > 50) {
      onNext();
    } else if (startX - endX < -50) {
      onPrev();
    }
  };

  useEffect(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      audioElement.volume = volume;
      const updateTime = () => {
        setCurrentTime(audioElement.currentTime);
        localStorage.setItem('currentTime', audioElement.currentTime.toString());
        localStorage.setItem('timestamp', Date.now().toString());
      };
      audioElement.addEventListener('timeupdate', updateTime);
      audioElement.addEventListener('ended', handleEnded);

      return () => {
        audioElement.removeEventListener('timeupdate', updateTime);
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [volume, handleEnded]);

  useEffect(() => {
    if (currentBeat && currentBeat.audio) {
      handlePlayPause(isPlaying);
    }
  }, [currentBeat, isPlaying, handlePlayPause]);

  useEffect(() => {
    const savedCurrentBeat = localStorage.getItem('currentBeat');
    const savedCurrentTime = localStorage.getItem('currentTime');
    if (savedCurrentBeat && savedCurrentTime) {
      setCurrentBeat(JSON.parse(savedCurrentBeat));
      const currentTime = parseFloat(savedCurrentTime);
      const audioElement = playerRef.current?.audio?.current;
      if (audioElement) {
        audioElement.currentTime = currentTime;
      }
    }
  }, [setCurrentBeat]);

  useEffect(() => {
    const rhapContainer = document.querySelector('.rhap_container');
    const rhapProgressContainer = document.querySelector('.rhap_progress-container');
    if (rhapContainer) rhapContainer.tabIndex = -1;
    if (rhapProgressContainer) rhapProgressContainer.tabIndex = -1;
  }, []);

  const handlePrevClick = useCallback(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      if (audioElement.currentTime > 3) {
        audioElement.currentTime = 0;
      } else {
        onPrev();
      }
    }
  }, [onPrev, playerRef]);

  const handlePlay = (beat, play, beats, setSelectedBeat, setBeats, currentBeat, setCurrentBeat, setIsPlaying) => {
    setSelectedBeat(beat);
    setBeats(beats);
    if (!beat) {
      setCurrentBeat(null);
      setIsPlaying(false);
    } else if (currentBeat && currentBeat.id === beat.id) {
      setIsPlaying(play);
    } else {
      setCurrentBeat(beat);
      setTimeout(() => setIsPlaying(true), 0);
    }
  };

  const handleNext = (repeat, shuffle, lastPlayedIndex, beats, currentBeat, setLastPlayedIndex, handlePlay, setIsPlaying) => {
    let nextIndex;
    if (shuffle) {
      do {
        nextIndex = Math.floor(Math.random() * beats.length);
      } while (nextIndex === lastPlayedIndex && beats.length > 1);
    } else {
      const currentIndex = beats.findIndex(beat => beat.id === currentBeat.id);
      nextIndex = (currentIndex + 1) % beats.length;
    }
    setLastPlayedIndex(nextIndex);
    if (repeat === 'Disabled Repeat' && nextIndex === 0) {
      handlePlay(beats[nextIndex], true, beats);
      setTimeout(() => setIsPlaying(false), 1);
    } else {
      handlePlay(beats[nextIndex], true, beats);
    }
  };

  const handlePrev = (beats, currentBeat, handlePlay, repeat, setRepeat) => {
    if (repeat === 'Repeat One') {
      setRepeat('Repeat');
    }
    const currentIndex = beats.findIndex(beat => beat.id === currentBeat.id);
    const prevIndex = (currentIndex - 1 + beats.length) % beats.length;
    handlePlay(beats[prevIndex], true, beats);
  };

  return {
    playerRef,
    volume,
    handleVolumeChange,
    isDragging,
    dragPosition,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handlePrevClick,
    handlePlay,
    handleNext,
    handlePrev,
    currentTime,
  };
};