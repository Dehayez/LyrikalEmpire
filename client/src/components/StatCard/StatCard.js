import React from 'react';
import PropTypes from 'prop-types';
import './StatCard.scss';

const StatCard = ({ title, value }) => {
  return (
    <div className="stat-card">
      <h2>{title}</h2>
      <p>{value}</p>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};

export default StatCard;