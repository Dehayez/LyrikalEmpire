import React from 'react';
import PropTypes from 'prop-types';
import './StatCard.scss';

const StatCard = ({ title, value, size }) => {
  return (
    <div className={`stat-card stat-card--${size}`}>
      <h2>{title}</h2>
      <p>{value}</p>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['large', 'small']),
};

StatCard.defaultProps = {
  size: 'small',
};

export default StatCard;