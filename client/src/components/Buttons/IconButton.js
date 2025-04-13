import React from 'react';
import classNames from 'classnames';
import { isMobileOrTablet } from '../../utils';
import { Tooltip } from '../Tooltip';
import './IconButton.scss';

const IconButton = ({ className = null, style, onClick, children, text, tooltipPosition = 'top', ariaLabel }) => {
  const classes = classNames('icon-button', className, {
    'icon-button--mobile': isMobileOrTablet(),
  });

  return (
    <button className={classes} style={style} onClick={onClick} aria-label={ariaLabel}>
      {children}
      {!isMobileOrTablet() && text && <Tooltip text={text} position={tooltipPosition} />}
    </button>
  );
};

export default IconButton;