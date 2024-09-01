import React, { useEffect, useRef, useState, useCallback } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';

import { isMobileOrTablet } from '../../utils';
import { useLocalStorageSync } from '../../hooks';

import { NextButton, PlayPauseButton, PrevButton, VolumeSlider, ShuffleButton, RepeatButton } from './AudioControls';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.scss';

const AudioPlayer = ({ currentBeat, setCurrentBeat, isPlaying, setIsPlaying, onNext, onPrev, shuffle, setShuffle, repeat, setRepeat }) => {
  const playerRef = useRef();
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('volume');
    return savedVolume !== null ? parseFloat(savedVolume) : 1.0;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragPosition, setDragPosition] = useState(0);

  useLocalStorageSync({
    shuffle,
    repeat,
    currentBeat,
    volume,
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

  return isMobileOrTablet() ? (
    <div className="audio-player audio-player--mobile" id="audio-player">
      <H5AudioPlayer
          className="smooth-progress-bar smooth-progress-bar--mobile"
          autoPlayAfterSrcChange={true}
          src={currentBeat ? currentBeat.audio : ''}
          ref={playerRef}
          customProgressBarSection={[
              RHAP_UI.CURRENT_TIME,
              RHAP_UI.PROGRESS_BAR,
              RHAP_UI.DURATION
          ]}
        />
      {currentBeat && (
       <p className="audio-player__title" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={handleTouchMove} style={{ transform: `translateX(${dragPosition}px)` }}>
          {currentBeat.title}
        </p>
      )}
      <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} className="small" />
    </div>
  ) : (
    <div className="audio-player" id="audio-player">
      <div className='audio-player__title audio-player__title--desktop' style={{ flex: '1' }}>
        {currentBeat && <p>{currentBeat.title}</p>}
      </div>
      <div style={{ flex: '2' }}>
        <H5AudioPlayer
          className="smooth-progress-bar"
          autoPlayAfterSrcChange={true}
          src={currentBeat ? currentBeat.audio : ''}
          ref={playerRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          customProgressBarSection={[
              RHAP_UI.CURRENT_TIME,
              RHAP_UI.PROGRESS_BAR,
              RHAP_UI.DURATION
          ]}
          customControlsSection={[
            <ShuffleButton shuffle={shuffle} setShuffle={setShuffle} />,
            <PrevButton onPrev={handlePrevClick} />,
            <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />,
            <NextButton onNext={onNext} />,
            <RepeatButton repeat={repeat} setRepeat={setRepeat} />,
          ]}
        />
      </div>
      <VolumeSlider volume={volume} handleVolumeChange={handleVolumeChange} />
    </div>
  );
};

export default AudioPlayer;