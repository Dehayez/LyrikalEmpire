import React from 'react';
import './Tooltip.scss';

const Tooltip = ({ position, className = '', text }) => {
  const positionClass = position ? `tooltip--${position}` : '';
  return (
    <span className={`tooltip ${positionClass} ${className}`}>
      {text}
    </span>
  );
};

export default Tooltip;