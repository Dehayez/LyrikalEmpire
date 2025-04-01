import React from 'react';
import classNames from 'classnames';
import { isMobileOrTablet } from '../../utils';
import './IconButton.scss';

const IconButton = ({ className = null, onClick, children }) => {
  const classes = classNames('icon-button', className, {
    'icon-button--mobile': isMobileOrTablet(),
  });

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default IconButton;