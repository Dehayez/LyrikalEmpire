import React from 'react';
import { useData } from '../contexts';
import '../globals/pageStyles.scss';

const GenresPage = () => {
  const { genres } = useData();

  return (
    <div>
      <h1 className="page-title">All Genres</h1>
      <ul className="page-list">
        {genres.map((genre) => (
          <li key={genre.id} className="page-list-item">{genre.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default GenresPage;