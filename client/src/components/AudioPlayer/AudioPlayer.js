import React, { useEffect, useRef, useState } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { NextButton, PlayPauseButton, PrevButton, VolumeSlider } from './AudioControls';
import './AudioPlayer.scss';

let currentPlaying;

const AudioPlayer = ({ currentBeat, isPlaying, setIsPlaying, onNext, onPrev }) => {
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
      play ? playerRef.current.audio.current.play() : playerRef.current.audio.current.pause();
    }
  }

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
  }, [currentBeat, isPlaying]);

  useEffect(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      audioElement.addEventListener('ended', onNext);
    }
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', onNext);
      }
    };
  }, [onNext]);

  useEffect(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      audioElement.addEventListener('loadedmetadata', () => {
        audioElement.currentTime = 0;
      });
    }
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('loadedmetadata', () => {});
      }
    };
  }, [currentBeat]);

  useEffect(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      audioElement.volume = volume;
    }
  }, [volume]);

  return (
    <div className="audio-player" id="audio-player" style={{
      display: 'flex', 
      alignItems: 'center', 
      position: 'fixed', 
      bottom: currentBeat ? 0 : '-100%',
      width: '100%',
      transition: 'bottom 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
      padding: '0 20px',
      boxSizing: 'border-box',
      backgroundColor: '#181818',
      zIndex: 1
    }}>
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
          <PrevButton onPrev={onPrev} />,
          <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />,
          <NextButton onNext={onNext} />
        ]}
        />
      </div>
      <VolumeSlider volume={volume} handleVolumeChange={handleVolumeChange} />
    </div>
  );
};

export default AudioPlayer;