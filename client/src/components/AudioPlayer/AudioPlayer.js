import React, { useEffect, useRef, useState, useCallback } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { NextButton, PlayPauseButton, PrevButton, VolumeSlider } from './AudioControls';
import { IoShuffleSharp, IoRepeatSharp } from 'react-icons/io5';
import './AudioPlayer.scss';

let currentPlaying;

const AudioPlayer = ({ currentBeat, isPlaying, setIsPlaying, onNext, onPrev, shuffle, setShuffle, repeat, setRepeat }) => {
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
          playPromise.then(_ => {
            // Automatic playback started!
          }).catch(error => {
            // Auto-play was prevented
            // Show a UI element to let the user manually start playback
          });
        }
      } else if (!play && !audio.paused) {
        audio.pause();
      }
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

  const handleEnded = useCallback(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      if (repeat === 'Repeat One') {
        audioElement.currentTime = 0; // Set the audio time to 0
        audioElement.play(); // Play the audio
      } else {
        onNext();
      }
    }
  }, [onNext, repeat]);

  useEffect(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      audioElement.removeEventListener('ended', onNext); // Remove this line
      audioElement.addEventListener('ended', handleEnded);
    }
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', handleEnded);
      }
    };
  }, [handleEnded]);
  
  useEffect(() => {
    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      audioElement.addEventListener('ended', handleEnded);
    }
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', handleEnded);
      }
    };
  }, [handleEnded]);

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
            { repeat === 'Disabled Repeat' ? <IoRepeatSharp style={{ color: '#B3B3B3' }}/> : repeat === 'Repeat' ? <IoRepeatSharp style={{ color: '#FFFFFF' }}/> : <IoRepeatSharp style={{ color: '#FFCC44' }}/> }
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