import React from 'react';
import { useData } from '../contexts';

const KeywordsPage = () => {
  const { keywords } = useData();

  return (
    <div>
      <h1>All Keywords</h1>
      <ul>
        {keywords.map((keyword) => (
          <li key={keyword.id}>{keyword.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default KeywordsPage;