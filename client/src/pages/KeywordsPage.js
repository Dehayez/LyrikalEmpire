import React from 'react';
import { useData } from '../contexts';
import '../globals/pageStyles.scss';

const KeywordsPage = () => {
  const { keywords } = useData();

  return (
    <div>
      <h1 className="page-title">All Keywords</h1>
      <ul className="page-list">
        {keywords.map((keyword) => (
          <li key={keyword.id} className="page-list-item">{keyword.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default KeywordsPage;