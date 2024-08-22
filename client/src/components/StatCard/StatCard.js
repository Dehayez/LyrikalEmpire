import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './StatCard.scss';

const StatCard = ({ title, value, size = 'small', link = null, onMouseEnter, onMouseLeave, children }) => {
  const cardContent = (
    <>
      <h2>{title}</h2>
      <p>{value}</p>
      {children}
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
  title: PropTypes.string,
  value: PropTypes.number,
  size: PropTypes.oneOf(['large', 'small', 'full-width']),
  link: PropTypes.string,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  children: PropTypes.node,
};

export default StatCard;