// AudioPlayer.js
import React, { useEffect, useRef, useState } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.scss';
import { IoPlaySkipBackSharp, IoPlaySkipForwardSharp, IoPlaySharp, IoPauseSharp } from "react-icons/io5";

let currentPlaying;

const AudioPlayer = ({ currentTrack, isPlaying, setIsPlaying, onNext, onPrev }) => {
  const playerRef = useRef();
  const [animatePlayPause, setAnimatePlayPause] = useState(false);
  const [isPrevActive, setIsPrevActive] = useState(false);
  const [isNextActive, setIsNextActive] = useState(false);

  const handlePlayPause = (play) => {
    if (playerRef.current && playerRef.current.audio && playerRef.current.audio.current) {
      play ? playerRef.current.audio.current.play() : playerRef.current.audio.current.pause();
    }
  }

  useEffect(() => {
    if (currentTrack && currentTrack.audio) {
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
  }, [currentTrack, isPlaying]);

  const handleListen = () => {
    if (playerRef.current) {
      setIsPlaying(!playerRef.current.audio.current.paused);
    }
  };

  const handlePlayPauseClick = () => {
    setIsPlaying(!isPlaying);
    setAnimatePlayPause(true);
    setTimeout(() => setAnimatePlayPause(false), 200);
  };

  const handleEnded = () => {
    onNext();
  };

  return (
    <div className="audio-player-wrapper">
      <H5AudioPlayer
        autoPlayAfterSrcChange={true}
        src={currentTrack ? currentTrack.audio : ''}
        ref={playerRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onListen={handleListen}
        onEnded={handleEnded}
        customProgressBarSection={[
            RHAP_UI.CURRENT_TIME,
            RHAP_UI.PROGRESS_BAR,
            RHAP_UI.DURATION
        ]}
        customControlsSection={[
          <button 
          className={`icon-button icon-button__prev ${isPrevActive ? 'active' : ''}`} 
          onMouseDown={() => setIsPrevActive(true)}
          onMouseUp={() => setIsPrevActive(false)}
          onMouseLeave={() => setIsPrevActive(false)}
          onClick={onPrev}
        >
          <span className="tooltip">Previous</span>
          <IoPlaySkipBackSharp size={24} />
        </button>,
        <button 
          className={`icon-button play-pause ${animatePlayPause ? 'animate-scale' : ''}`} 
          onMouseDown={() => setAnimatePlayPause(true)}
          onMouseUp={() => setAnimatePlayPause(false)}
          onMouseLeave={() => setAnimatePlayPause(false)}
          onClick={handlePlayPauseClick}
        >
           <span className="tooltip">{isPlaying ? 'Pause' : 'Play'}</span>
          {isPlaying ? <IoPauseSharp size={24} /> : <IoPlaySharp size={24} />}
        </button>,
        <button 
        className={`icon-button icon-button__next ${isNextActive ? 'active' : ''}`} 
        onMouseDown={() => setIsNextActive(true)}
        onMouseUp={() => setIsNextActive(false)}
        onMouseLeave={() => setIsNextActive(false)}
        onClick={onNext}
      >
        <span className="tooltip">Next</span>
        <IoPlaySkipForwardSharp size={24} />
      </button>
      ]}
      />
    </div>
  );
};

export default AudioPlayer;