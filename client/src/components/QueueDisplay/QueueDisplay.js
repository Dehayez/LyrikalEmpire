import React from 'react';

const QueueDisplay = ({ queue, removeFromQueue }) => {
  return (
    <div>
      <h3>Up Next</h3>
      <ul>
        {queue.map((beat, index) => (
          <li key={index}>
            {beat.title} <button onClick={() => removeFromQueue(beat.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QueueDisplay;