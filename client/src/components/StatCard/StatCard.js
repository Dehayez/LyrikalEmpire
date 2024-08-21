import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './StatCard.scss';

const StatCard = ({ title, value, size = 'small', link = null }) => {
  const cardContent = (
    <>
      <h2>{title}</h2>
      <p>{value}</p>
    </>
  );

  return (
    <div className={`stat-card stat-card--${size}`}>
      {link ? <Link to={link}>{cardContent}</Link> : cardContent}
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['large', 'small']),
  link: PropTypes.string,
};

export default StatCard;