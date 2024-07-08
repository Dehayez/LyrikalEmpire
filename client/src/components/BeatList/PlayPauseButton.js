import React from 'react';
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";
import './PlayPauseButton.scss';

const PlayPauseButton = ({ beat, handlePlayPause, currentBeat, isPlaying }) => {
  return (
    <button className="icon-button icon-button--play-pause" onClick={() => handlePlayPause(beat)}>
      {currentBeat && currentBeat.id === beat.id && isPlaying ? <IoPauseSharp fontSize={18} /> : <IoPlaySharp fontSize={18} />}
      <span className="tooltip">
        {currentBeat && currentBeat.id === beat.id && isPlaying ? 'Pause' : 'Play'}
      </span>
    </button>
  );
};

export default PlayPauseButton;