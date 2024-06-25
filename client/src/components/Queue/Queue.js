import React from 'react';
import './Queue.scss';

const Queue = ({ queue }) => {
  return (
    <div className="queue">
      <h2 className="queue__title">Queue</h2>
      <ul className="queue__list">
        {queue.map((beat, index) => (
          <li className='queue__list-item' key={index}>{beat.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Queue;