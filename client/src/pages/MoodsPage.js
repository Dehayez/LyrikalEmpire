import React from 'react';
import { useData } from '../contexts';

const MoodsPage = () => {
  const { moods } = useData();

  return (
    <div>
      <h1>All Moods</h1>
      <ul>
        {moods.map((mood) => (
          <li key={mood.id}>{mood.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MoodsPage;