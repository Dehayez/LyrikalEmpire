import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './StatCard.scss';

const StatCard = ({ title, value, size = 'small', link = null, onMouseEnter, onMouseLeave }) => {
  const cardContent = (
    <>
      <h2>{title}</h2>
      <p>{value}</p>
    </>
  );

  const card = (
    <div className={`stat-card stat-card--${size}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {cardContent}
    </div>
  );

  return link ? (
    <Link to={link} className={`stat-card-link stat-card--${size}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {card}
    </Link>
  ) : (
    card
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['large', 'small']),
  link: PropTypes.string,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

export default StatCard;