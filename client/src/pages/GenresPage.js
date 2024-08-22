import React from 'react';
import { useData } from '../contexts';
import { StatCard, StatChart } from '../components';

import '../globals/pageStyles.scss';

const GenresPage = () => {
  const { genres } = useData();

  return (
    <div className="page">
      <h1 className="page-title">Genres</h1>
      <StatCard size="full-width">
        <StatChart filterOption="genres" />
      </StatCard>
      <ul className="page-list">
        {genres.map((genre) => (
          <li key={genre.id} className="page-list-item">{genre.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default GenresPage;