import React, { useState, useEffect } from 'react';
import './BeatAnimation.scss';

const BeatAnimation = ({ beat, selectedBeat, isPlaying, hoveredBeat, index }) => {
  
  const [delays, setDelays] = useState([0, 0, 0, 0]);
  const [durations, setDurations] = useState([0, 0, 0, 0]);

  useEffect(() => {
    setDelays([0.5, 1, 1.5, 2]);
    setDurations([1.5, 2, 2.5, 3]);
  }, []);

  return (
    selectedBeat && selectedBeat.id === beat.id && isPlaying ? 
    <div className="animation-container" style={{ animation: `barAnimation ${120 / beat.bpm}s infinite`, opacity: hoveredBeat === beat.id ? 0 : 1 }}>
        <div className="bar" style={{ animationDelay: `-${delays[0]}s`, animationDuration: `${durations[0]}s` }}></div>
        <div className="bar" style={{ animationDelay: `-${delays[1]}s`, animationDuration: `${durations[1]}s` }}></div>
        <div className="bar" style={{ animationDelay: `-${delays[2]}s`, animationDuration: `${durations[2]}s` }}></div>
        <div className="bar" style={{ animationDelay: `-${delays[3]}s`, animationDuration: `${durations[3]}s` }}></div>
      </div> : 
      <div style={{ zIndex: 1, minWidth: '30px', color: selectedBeat && selectedBeat.id === beat.id ? '#FFCC44' : '', opacity: hoveredBeat === beat.id ? 0 : 1 }}>{index + 1}</div>
  );
};

export default BeatAnimation;