import React from 'react';
import './Queue.scss';

const Queue = ({ queue, currentBeat, onBeatClick }) => {
  const handleBeatClick = (beat) => {
    if (onBeatClick) {
      onBeatClick(beat);
    }
  };

  return (
    <div className="queue">
      <h2 className="queue__title">Queue</h2>
      {queue.length > 0 && (
        <>
          <h3 className="queue__subtitle">Now Playing</h3>
          <ul className="queue__list">
            <li className={`queue__list-item queue__list-item--playing`} key={queue[0].id}>
              {queue[0].title}
            </li>
          </ul>
        </>
      )}
      {queue.length > 1 && (
        <>
          <h3 className="queue__subtitle">Up Next</h3>
          <ul className="queue__list">
            {queue.slice(1).map((beat) => (
              <li
                className={`queue__list-item ${currentBeat && beat.id === currentBeat.id ? 'queue__list-item--playing' : ''}`}
                key={beat.id}
                onClick={() => handleBeatClick(beat)}
              >
                {beat.title}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Queue;