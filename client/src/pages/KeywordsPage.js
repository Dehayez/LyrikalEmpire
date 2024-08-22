import React from 'react';
import { useData } from '../contexts';
import { StatCard, StatChart } from '../components';

import '../globals/pageStyles.scss';

const KeywordsPage = () => {
  const { keywords } = useData();

  return (
    <div className="page">
      <h1 className="page-title">Keywords</h1>
      <StatCard size="full-width">
        <StatChart filterOption="keywords" />
      </StatCard>
      <ul className="page-list">
        {keywords.map((keyword) => (
          <li key={keyword.id} className="page-list-item">{keyword.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default KeywordsPage;