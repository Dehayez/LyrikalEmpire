import React from 'react';
import { useData } from '../contexts';
import { StatCard, StatChart } from '../components';

import '../globals/pageStyles.scss';

const FeaturesPage = () => {
  const { features } = useData();

  return (
    <div className="page">
      <h1 className="page-title">Features</h1>
      <StatCard size="full-width">
        <StatChart filterOption="features" />
      </StatCard>
      <ul className="page-list">
        {features.map((feature) => (
          <li key={feature.id} className="page-list-item">{feature.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default FeaturesPage;