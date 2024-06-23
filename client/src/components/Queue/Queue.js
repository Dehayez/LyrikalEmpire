import React from 'react';

const Queue = ({ queue }) => {
  return (
    <div className="queue-container">
      <h2>Queue</h2>
      <ul>
        {queue.map((beat, index) => (
          <li key={index}>{beat.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Queue;