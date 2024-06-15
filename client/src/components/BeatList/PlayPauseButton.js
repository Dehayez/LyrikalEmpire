import React from 'react';
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";

const PlayPauseButton = ({ beat, handlePlayPause, selectedBeat, isPlaying, styles }) => {
  return (
    <button
      style={styles.playPauseButton}
      className="icon-button"
      onClick={() => handlePlayPause(beat)}
    >
      {selectedBeat && selectedBeat.id === beat.id && isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
      <span className="tooltip">
        {selectedBeat && selectedBeat.id === beat.id && isPlaying ? 'Pause' : 'Play'}
      </span>
    </button>
  );
};

export default PlayPauseButton;