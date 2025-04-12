import React from 'react';
import classNames from 'classnames';
import { isMobileOrTablet } from '../../utils';
import { Tooltip } from '../Tooltip';
import './IconButton.scss';

const IconButton = ({ className = null, onClick, children, text, tooltipPosition = 'top' }) => {
  const classes = classNames('icon-button', className, {
    'icon-button--mobile': isMobileOrTablet(),
  });

  return (
    <div className={classes} onClick={onClick}>
      {children}
      {!isMobileOrTablet() && text && <Tooltip text={text} position={tooltipPosition} />}
    </div>
  );
};

export default IconButton;