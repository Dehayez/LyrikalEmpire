import React from 'react';
import './History.scss';

const History = ({ onBeatClick, currentBeat }) => {
  const history = JSON.parse(localStorage.getItem('playedBeatsHistory') || '[]');
  const handleBeatClick = (beat) => {
    if (onBeatClick) {
      onBeatClick(beat);
    }
  };

  return (
    <div className="history">
       <ul className='history__list'>
          {history.map((beat, index) => (
            <li 
            className={`history__list-item ${currentBeat && beat.id === currentBeat.id ? 'history__list-item--playing' : ''}`}
              key={index} onClick={() => handleBeatClick(beat)}
            >
              {beat.title}
            </li>
          ))}
        </ul>
    </div>
  );
};

export default History;