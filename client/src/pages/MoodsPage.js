import React from 'react';
import { useData } from '../contexts';
import '../globals/pageStyles.scss';

const MoodsPage = () => {
  const { moods } = useData();

  return (
    <div>
      <h1 className="page-title">All Moods</h1>
      <ul className="page-list">
        {moods.map((mood) => (
          <li key={mood.id} className="page-list-item">{mood.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MoodsPage;