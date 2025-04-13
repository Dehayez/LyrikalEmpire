import React from 'react';
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";
import { useBeat } from '../../contexts';
import { IconButton } from '../Buttons';
import './PlayPauseButton.scss';

const PlayPauseButton = ({ beat, handlePlayPause, currentBeat, isPlaying }) => {
  const isCurrentBeatPlaying = currentBeat?.id === beat.id && isPlaying;
  const { hoveredBeat } = useBeat();

  return (
    <IconButton
      className="icon-button--play-pause"
      onClick={() => handlePlayPause(beat)}
      style={{ opacity: hoveredBeat === beat.id ? 1 : 0 }}
      aria-label={isCurrentBeatPlaying ? 'Pause' : 'Play'}
    >
      {isCurrentBeatPlaying ? <IoPauseSharp fontSize={18} /> : <IoPlaySharp fontSize={18} />}
    </IconButton>
  );
};

export default PlayPauseButton;