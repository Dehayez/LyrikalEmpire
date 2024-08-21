import React from 'react';
import { useBeat } from '../contexts';

const BeatsPage = () => {
  const { allBeats } = useBeat();

  return (
    <div>
      <h1>All Beats</h1>
      <ul>
        {allBeats.map((beat) => (
          <li key={beat.id}>{beat.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default BeatsPage;