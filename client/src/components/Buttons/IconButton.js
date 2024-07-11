import React from 'react';
import { isMobileOrTablet } from '../../utils';
import './IconButton.scss';

const IconButton = ({ className, onClick, children }) => {
  return (
    <div className={`icon-button ${className} ${isMobileOrTablet() ? 'icon-button--mobile' : ''}`} onClick={onClick}>
        {children}
    </div>
  );
};

export default IconButton;