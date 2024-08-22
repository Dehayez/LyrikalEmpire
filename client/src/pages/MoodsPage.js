import React from 'react';
import { useData } from '../contexts';
import { StatCard, StatChart } from '../components';

import '../globals/pageStyles.scss';

const MoodsPage = () => {
  const { moods } = useData();

  return (
    <div className="page">
      <h1 className="page-title">Moods</h1>
      <StatCard size="full-width">
        <StatChart filterOption="moods" />
      </StatCard>
      <ul className="page-list">
        {moods.map((mood) => (
          <li key={mood.id} className="page-list-item">{mood.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MoodsPage;