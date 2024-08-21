import React from 'react';
import { useData } from '../contexts';

const FeaturesPage = () => {
  const { features } = useData();

  return (
    <div>
      <h1>All Features</h1>
      <ul>
        {features.map((feature) => (
          <li key={feature.id}>{feature.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default FeaturesPage;