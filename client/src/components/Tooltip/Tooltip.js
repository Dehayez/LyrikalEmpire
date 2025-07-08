import React from 'react';
import './Tooltip.scss';

const Tooltip = ({ position, className = '', text, shortcutText }) => {
  const positionClass = position ? `tooltip--${position}` : '';
  return (
    <span className={`tooltip ${positionClass} ${className}`}>
      <span className="tooltip__text">{text}</span>
      {shortcutText ? (
        <span className="tooltip__shortcut">{shortcutText}</span>
      ) : null}
    </span>
  );
};

export default Tooltip;