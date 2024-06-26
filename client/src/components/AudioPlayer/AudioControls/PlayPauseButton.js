import React, { useState, useEffect } from 'react';
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";
import './PlayPauseButton.scss';

const PlayPauseButton = ({ isPlaying, setIsPlaying }) => {
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
    // Media Session API integration
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
      // Check if the event target is an input, textarea, or select
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return; // Ignore key press
      }
    
      if (event.key === ' ' || event.code === 'MediaPlayPause') {
        event.preventDefault(); // Prevent scrolling on spacebar press
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    setMediaSession();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Reset Media Session action handlers to null when component unmounts
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      }
    };
  }, [isPlaying, setIsPlaying]);

  return (
    <button 
      className={`icon-button play-pause ${animatePlayPause ? 'animate-scale' : ''}`} 
      onMouseDown={() => setAnimatePlayPause(true)}
      onMouseUp={() => setAnimatePlayPause(false)}
      onMouseLeave={() => setAnimatePlayPause(false)}
      onClick={handlePlayPauseClick}
    >
      <span className="tooltip">{isPlaying ? 'Pause' : 'Play'}</span>
      {isPlaying ? <IoPauseSharp size={24} /> : <IoPlaySharp size={24} />}
    </button>
  );
};

export default PlayPauseButton;