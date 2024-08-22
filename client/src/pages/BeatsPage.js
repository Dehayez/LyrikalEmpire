import React from 'react';
import { useBeat } from '../contexts';
import { StatCard, StatChart } from '../components';

import '../globals/pageStyles.scss';

const BeatsPage = () => {
  const { allBeats } = useBeat();

  return (
    <div className='page'>
      <h1 className="page-title">Beats</h1>
      <StatCard size="full-width">
        <StatChart filterOption="beats" />
      </StatCard>
      <ul className="page-list">
        {allBeats.map((beat) => (
          <li key={beat.id} className="page-list-item">{beat.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default BeatsPage;