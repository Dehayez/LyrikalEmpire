import React from 'react';
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";

const styles = {
  playPauseButton: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, zIndex: 2 },
};

const PlayPauseButton = ({ beat, handlePlayPause, currentBeat, isPlaying }) => {
  return (
    <button
      style={styles.playPauseButton}
      className="icon-button icon-button--play-pause"
      onClick={() => handlePlayPause(beat)}
    >
      {currentBeat && currentBeat.id === beat.id && isPlaying ? <IoPauseSharp fontSize={18} /> : <IoPlaySharp fontSize={18} />}
      <span className="tooltip">
        {currentBeat && currentBeat.id === beat.id && isPlaying ? 'Pause' : 'Play'}
      </span>
    </button>
  );
};

export default PlayPauseButton;