import React, { useState, useEffect } from 'react';
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";

import { Tooltip } from '../../Tooltip';

import './PlayPauseButton.scss';

const PlayPauseButton = ({ isPlaying, setIsPlaying, className }) => {
  const [animatePlayPause, setAnimatePlayPause] = useState(false);

  const handlePlayPauseClick = () => {
    togglePlayPause();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    setAnimatePlayPause(true);
    setTimeout(() => setAnimatePlayPause(false), 200);
  };

  useEffect(() => {
    const setMediaSession = () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
          if (!isPlaying) togglePlayPause();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          if (isPlaying) togglePlayPause();
        });
      }
    };

    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return;
      }
    
      if (event.key === ' ' || event.code === 'MediaPlayPause') {
        event.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    setMediaSession();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      }
    };
  }, [isPlaying, setIsPlaying]);

  return (
    <button 
      className={`icon-button play-pause ${animatePlayPause ? 'animate-scale' : ''} ${className}`}
      onMouseDown={() => setAnimatePlayPause(true)}
      onMouseUp={() => setAnimatePlayPause(false)}
      onMouseLeave={() => setAnimatePlayPause(false)}
      onClick={handlePlayPauseClick}
    >
      <Tooltip text={isPlaying ? 'Pause' : 'Play'} />
      {isPlaying ? <IoPauseSharp size={24} /> : <IoPlaySharp size={24} />}
    </button>
  );
};

export default PlayPauseButton;