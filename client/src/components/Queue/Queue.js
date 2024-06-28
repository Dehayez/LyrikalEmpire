import React from 'react';
import './Queue.scss';

const Queue = ({ queue, currentBeat, onBeatClick, isShuffleEnabled }) => {
  const handleBeatClick = (beat) => {
    if (onBeatClick) {
      onBeatClick(beat);
    }
  };

  const getNextItemForShuffle = () => {
    if (queue.length > 1) {
      return queue.slice(1).map((item, index) => ({
        ...item,
        uniqueKey: item.uniqueKey || `non-shuffle-${item.id}-${index}`
      }));
    }
    return [];
  };

  return (
    <div className="queue">
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
          {(isShuffleEnabled ? getNextItemForShuffle() : queue.slice(1).map((item, index) => ({
            ...item,
            uniqueKey: `non-shuffle-${item.id}-${index}`
          }))).map((beat) => (
            <li
              className={`queue__list-item ${currentBeat && beat.id === currentBeat.id ? 'queue__list-item--playing' : ''}`}
              key={beat.uniqueKey}
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