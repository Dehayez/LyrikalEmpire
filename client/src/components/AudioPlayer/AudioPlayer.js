import React, { useEffect, useRef, useState, useCallback } from 'react';
import { isMobileOrTablet } from '../../utils';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import { NextButton, PlayPauseButton, PrevButton, VolumeSlider, ShuffleButton, RepeatButton } from './AudioControls';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.scss';

let currentPlaying;

const AudioPlayer = ({ currentBeat, setCurrentBeat, isPlaying, setIsPlaying, onNext, onPrev, shuffle, setShuffle, repeat, setRepeat }) => {
  const playerRef = useRef();
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('volume');
    return savedVolume !== null ? parseFloat(savedVolume) : 1.0;
  });

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('volume', newVolume);
  };

  const handlePlayPause = (play) => {
    if (playerRef.current && playerRef.current.audio && playerRef.current.audio.current) {
      const audio = playerRef.current.audio.current;
      if (play && audio.paused) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(_ => {}).catch(error => {});
        }
      } else if (!play && !audio.paused) {
        audio.pause();
      }
    }
  }

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

  useEffect(() => {
    const savedCurrentTime = localStorage.getItem('currentTime');
    if (savedCurrentTime) {
      const currentTime = parseFloat(savedCurrentTime);
      if (playerRef.current && playerRef.current.audio && playerRef.current.audio.current) {
        playerRef.current.audio.current.currentTime = currentTime;
      }
    }
  }, []);

  useEffect(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      audioElement.volume = volume;
      const updateTime = () => {
        localStorage.setItem('currentTime', audioElement.currentTime);
        localStorage.setItem('timestamp', Date.now());
      };
      audioElement.addEventListener('timeupdate', updateTime);
      return () => {
        audioElement.removeEventListener('timeupdate', updateTime);
      };
    }
  }, [volume]);

  useEffect(() => {
    if (currentBeat && currentBeat.audio) {
      if (currentPlaying && currentPlaying !== playerRef.current) {
        handlePlayPause(false);
      }
      currentPlaying = playerRef.current;
      handlePlayPause(isPlaying);
    } else {
      if (playerRef.current && playerRef.current.audio && playerRef.current.audio.current) {
        playerRef.current.audio.current.currentTime = 0;
      }
    }
  
    if (!isPlaying && currentBeat && playerRef.current && playerRef.current.audio && playerRef.current.audio.current) {
      localStorage.setItem('currentBeat', JSON.stringify(currentBeat));
      localStorage.setItem('currentTime', playerRef.current.audio.current.currentTime.toString());
    }
  }, [currentBeat, isPlaying]);

  useEffect(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      audioElement.removeEventListener('ended', onNext);
      audioElement.addEventListener('ended', handleEnded);
      return () => {
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [handleEnded, onNext]);

  useEffect(() => {
    const savedCurrentBeat = localStorage.getItem('currentBeat');
    const savedCurrentTime = localStorage.getItem('currentTime');
    if (savedCurrentBeat && savedCurrentTime) {
      const currentBeat = JSON.parse(savedCurrentBeat);
      const currentTime = parseFloat(savedCurrentTime);
      setCurrentBeat(currentBeat);
      if (playerRef.current && playerRef.current.audio && playerRef.current.audio.current) {
        playerRef.current.audio.current.currentTime = currentTime;
      }
    }
  }, []);

  useEffect(() => {
    const rhapContainer = document.querySelector('.rhap_container');
    const rhapProgressContainer = document.querySelector('.rhap_progress-container');
  
    if (rhapContainer) {
      rhapContainer.tabIndex = -1;
    }
    if (rhapProgressContainer) {
      rhapProgressContainer.tabIndex = -1;
    }
  }, [])

  useEffect(() => {
    console.log('isMobileOrTablet', isMobileOrTablet());
  }, []);

  return isMobileOrTablet() ? (
    <div className="audio-player audio-player--mobile" id="audio-player">
      {currentBeat && <p>{currentBeat.title}</p>}
      <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} className="small" />
    </div>
  ) : (
    <div className="audio-player" id="audio-player">
      <div style={{ flex: '1' }}>
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
            <PrevButton onPrev={onPrev} />,
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