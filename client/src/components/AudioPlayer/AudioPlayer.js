import React, { useEffect, useRef, useState, useCallback } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { NextButton, PlayPauseButton, PrevButton, VolumeSlider } from './AudioControls';
import { IoShuffleSharp, IoRepeatSharp } from 'react-icons/io5';
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
    const savedTimestamp = localStorage.getItem('timestamp');
    const savedCurrentTime = localStorage.getItem('currentTime');
    if (savedTimestamp && savedCurrentTime) {
      const currentTime = parseFloat(savedCurrentTime);
      const timestamp = parseFloat(savedTimestamp);
      const elapsedTime = (Date.now() - timestamp) / 1000; // convert ms to s
      const newCurrentTime = currentTime + elapsedTime;
      if (playerRef.current && playerRef.current.audio && playerRef.current.audio.current) {
        playerRef.current.audio.current.currentTime = newCurrentTime;
      }
    }
  }, []);

  useEffect(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      audioElement.volume = volume;
      const updateTime = () => {
        localStorage.setItem('currentTime', audioElement.currentTime);
        localStorage.setItem('timestamp', Date.now()); // Save the timestamp
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
  
    // Save current beat and current time to local storage when paused
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
          <button className="icon-button icon-button--shuffle" onClick={() => setShuffle(!shuffle)}>
            <IoShuffleSharp style={{ color: shuffle ? '#FFCC44' : '#B3B3B3' }}/>
            <span className="tooltip tooltip--shuffle">{ shuffle ? 'Disable Shuffle' : 'Shuffle' }</span>
          </button>,
          <PrevButton onPrev={onPrev} />,
          <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />,
          <NextButton onNext={onNext} />,
          <button className="icon-button icon-button--repeat" onClick={() => setRepeat(prev => prev === 'Disabled Repeat' ? 'Repeat' : prev === 'Repeat' ? 'Repeat One' : 'Disabled Repeat')}>
            { repeat === 'Disabled Repeat' ? <IoRepeatSharp style={{ color: '#B3B3B3' }}/> : repeat === 'Repeat' ? <IoRepeatSharp style={{ color: '#FFCC44' }}/> : <IoRepeatSharp style={{ color: '#FFCC44' }}/> }
            { repeat === 'Repeat One' && <div className="repeat-one-indicator"></div> }
            <span className="tooltip tooltip--repeat">{ repeat === 'Disabled Repeat' ? 'Repeat' : repeat === 'Repeat' ? 'Repeat One' : 'Disable Repeat' }</span>
          </button>
        ]}
        />
      </div>
      <VolumeSlider volume={volume} handleVolumeChange={handleVolumeChange} />
    </div>
  );
};

export default AudioPlayer;