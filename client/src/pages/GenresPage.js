import React from 'react';
import { useData } from '../contexts';

const GenresPage = () => {
  const { genres } = useData();

  return (
    <div>
      <h1>All Genres</h1>
      <ul>
        {genres.map((genre) => (
          <li key={genre.id}>{genre.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default GenresPage;