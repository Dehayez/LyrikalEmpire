import React from 'react';
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";
import { useBeat } from '../../contexts/BeatContext';
import './PlayPauseButton.scss';

const PlayPauseButton = ({ beat, handlePlayPause, currentBeat, isPlaying }) => {
  const isCurrentBeatPlaying = currentBeat?.id === beat.id && isPlaying;
  const { hoveredBeat } = useBeat();

  return (
    <button 
      className="icon-button icon-button--play-pause" 
      onClick={() => handlePlayPause(beat)}
      style={{ opacity: hoveredBeat === beat.id ? 1 : 0 }}
    >
      {isCurrentBeatPlaying ? <IoPauseSharp fontSize={18} /> : <IoPlaySharp fontSize={18} />}
    </button>
  );
};

export default PlayPauseButton;