import React, { useState } from 'react';
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";
import './PlayPauseButton.scss';

const PlayPauseButton = ({ isPlaying, setIsPlaying }) => {
  const [animatePlayPause, setAnimatePlayPause] = useState(false);

  const handlePlayPauseClick = () => {
    setIsPlaying(!isPlaying);
    setAnimatePlayPause(true);
    setTimeout(() => setAnimatePlayPause(false), 200);
  };

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