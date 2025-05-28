import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocalStorageSync } from './useLocalStorageSync';

export const useAudioPlayer = ({ currentBeat, setCurrentBeat, isPlaying, setIsPlaying, onNext, onPrev, shuffle, repeat }) => {
  const playerRef = useRef();
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('volume')) || 1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragPosition, setDragPosition] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => parseFloat(localStorage.getItem('currentTime')) || 0);

  useLocalStorageSync({ shuffle, repeat, currentBeat, volume, currentTime });

  const handleVolumeChange = e => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('volume', newVolume.toString());
  };

  const handlePlayPause = useCallback(play => {
    const audio = playerRef.current?.audio?. current;
    if (audio) {
      play ? audio.play().catch(() => {}) : audio.pause();
    }
  }, []);

  const handleEnded = useCallback(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      repeat === 'Repeat One' ? (audioElement.currentTime = 0, audioElement.play()) : onNext();
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
    setDragPosition(touch.clientX - startX);
    e.preventDefault();
  };

  const handleTouchEnd = e => {
    const endX = e.changedTouches[0].clientX;
    setIsDragging(false);
    setDragPosition(0);
    startX - endX > 50 ? onNext() : startX - endX < -50 && onPrev();
  };

  useEffect(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      audioElement.volume = volume;
      const updateTime = () => {
        setCurrentTime(audioElement.currentTime);
        localStorage.setItem('currentTime', audioElement.currentTime.toString());
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
    if (currentBeat?.audio) handlePlayPause(isPlaying);
  }, [currentBeat, isPlaying, handlePlayPause]);

  useEffect(() => {
    const savedCurrentBeat = localStorage.getItem('currentBeat');
    const savedCurrentTime = localStorage.getItem('currentTime');
    if (savedCurrentBeat && savedCurrentTime) {
      setCurrentBeat(JSON.parse(savedCurrentBeat));
      const audioElement = playerRef.current?.audio?.current;
      if (audioElement) audioElement.currentTime = parseFloat(savedCurrentTime);
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
      audioElement.currentTime > 3 ? (audioElement.currentTime = 0) : onPrev();
    }
  }, [onPrev]);

  const handlePlay = (beat, play, beats) => {
    if (!beat) {
      setCurrentBeat(null);
      setIsPlaying(false);
    } else if (currentBeat?.id === beat.id) {
      setIsPlaying(play);
    } else {
      setCurrentBeat(beat);
      setTimeout(() => setIsPlaying(true), 0);
    }
  };

  const handleNext = (beats) => {
    let nextIndex;
    if (shuffle) {
      do {
        nextIndex = Math.floor(Math.random() * beats.length);
      } while (nextIndex === beats.findIndex(b => b.id === currentBeat.id) && beats.length > 1);
    } else {
      nextIndex = (beats.findIndex(b => b.id === currentBeat.id) + 1) % beats.length;
    }
    handlePlay(beats[nextIndex], true, beats);
  };

  const handlePrev = (beats) => {
    const currentIndex = beats.findIndex(b => b.id === currentBeat.id);
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