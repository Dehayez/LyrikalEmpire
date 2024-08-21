import React from 'react';
import { useBeat } from '../contexts';
import '../globals/pageStyles.scss';

const BeatsPage = () => {
  const { allBeats } = useBeat();

  return (
    <div>
      <h1 className="page-title">All Beats</h1>
      <ul className="page-list">
        {allBeats.map((beat) => (
          <li key={beat.id} className="page-list-item">{beat.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default BeatsPage;