import React from 'react';
import { useData } from '../contexts';
import '../globals/pageStyles.scss';

const FeaturesPage = () => {
  const { features } = useData();

  return (
    <div>
      <h1 className="page-title">All Features</h1>
      <ul className="page-list">
        {features.map((feature) => (
          <li key={feature.id} className="page-list-item">{feature.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default FeaturesPage;