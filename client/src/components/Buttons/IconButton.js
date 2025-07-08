import React, { useEffect } from 'react';
import classNames from 'classnames';
import { isMobileOrTablet } from '../../utils';
import { Tooltip } from '../Tooltip';
import './IconButton.scss';

const IconButton = ({
  active,
  className = null,
  style,
  onClick,
  children,
  text,
  shortcutText,
  tooltipPosition = 'top',
  ariaLabel,
  bottomLabel,
}) => {
  const classes = classNames('icon-button', className, {
    'icon-button--mobile': isMobileOrTablet(),
    'icon-button--active': active,
  });

  return (
    <button className={classes} style={style} onClick={onClick} aria-label={ariaLabel}>
      {children}
      {!isMobileOrTablet() && text && <Tooltip text={text} position={tooltipPosition} shortcutText={shortcutText} />}
      {bottomLabel && (
        <span className="icon-button__bottom-label">{bottomLabel}</span>
      )}
    </button>
  );
};

export default IconButton;