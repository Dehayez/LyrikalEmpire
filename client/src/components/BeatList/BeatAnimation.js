import React from 'react';
import './BeatAnimation.scss';

const BeatAnimation = ({ beat, selectedBeat, isPlaying, hoveredBeat, index }) => {
  return (
    selectedBeat && selectedBeat.id === beat.id && isPlaying ? 
      <div className="animation-container" style={{ animationDuration: `${60 / beat.bpm}s`, opacity: hoveredBeat === beat.id ? 0 : 1 }}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div> : 
      <div style={{ zIndex: 1, color: selectedBeat && selectedBeat.id === beat.id ? '#FFCC44' : '', opacity: hoveredBeat === beat.id ? 0 : 1 }}>{index + 1}</div>
  );
};

export default BeatAnimation;