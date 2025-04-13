import React from 'react';
import { IoMenuSharp, IoListSharp, IoLockOpen, IoLockClosed } from 'react-icons/io5';
import { IconButton } from '../Buttons';
import { isMobileOrTablet } from '../../utils';

import './PanelToggle.scss';

const PanelToggle = ({
  isPanelVisible,
  isDivVisible,
  isHovered,
  setHovered,
  handleMouseEnter,
  handleMouseLeave,
  handleClick,
  position,
}) => {
  const tooltipPosition = position === 'left' ? 'right' : 'left';
  const hoverClass = isMobileOrTablet() ? 'icon-button--mobile' : '';

  return (
    <div
      {...(!isMobileOrTablet()
        ? {
            onMouseEnter: () => {
              setHovered(true);
              handleMouseEnter();
            },
            onMouseLeave: () => {
              setHovered(false);
              handleMouseLeave();
            },
          }
        : {})}
      onClick={handleClick}
      className={`panel-toggle panel-toggle--${position}`}
    >
    {isPanelVisible ? (
      <IconButton
        className={hoverClass}
        text={isHovered ? 'Unlock Panel' : 'Lock Panel'}
        tooltipPosition={tooltipPosition}
        ariaLabel={isHovered ? 'Unlock Panel' : 'Lock Panel'}
      >
        {isHovered ? <IoLockOpen /> : <IoLockClosed />}
      </IconButton>
    ) : isDivVisible ? (
      <IconButton
        text={isHovered ? 'Lock Panel' : 'Unlock Panel'}
        tooltipPosition={tooltipPosition}
        ariaLabel={isHovered ? 'Lock Panel' : 'Unlock Panel'}
      >
        {isHovered ? <IoLockClosed /> : <IoLockOpen />}
      </IconButton>
    ) : (
      <IconButton
        className={hoverClass}
        text={position === 'left' ? 'Open Menu' : 'Open List'}
        tooltipPosition={tooltipPosition}
        ariaLabel={position === 'left' ? 'Open Menu' : 'Open List'}
      >
        {position === 'left' ? <IoMenuSharp /> : <IoListSharp />}
      </IconButton>
    )}
    </div>
  );
};

export default PanelToggle;