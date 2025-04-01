import React from 'react';
import { IoMenuSharp, IoListSharp, IoLockOpen, IoLockClosed } from 'react-icons/io5';
import { IconButton } from '../Buttons';
import { Tooltip } from '../Tooltip';
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
      {...(!isMobileOrTablet() ? { onMouseEnter: () => { setHovered(true); handleMouseEnter(); }, onMouseLeave: () => { setHovered(false); handleMouseLeave(); } } : {})}
      onClick={handleClick}
      className={`panel-toggle panel-toggle--${position}`}
    >
      {isPanelVisible ? (
        <IconButton className={hoverClass}>
          {isHovered ? <IoLockOpen /> : <IoLockClosed />}
          {!isMobileOrTablet() && <Tooltip text={isHovered ? 'Unlock Panel' : 'Lock Panel'} position={tooltipPosition} />}
        </IconButton>
      ) : isDivVisible ? (
        <IconButton>
          {isHovered ? <IoLockClosed /> : <IoLockOpen />}
          {!isMobileOrTablet() && <Tooltip text={isHovered ? 'Lock Panel' : 'Unlock Panel'} position={tooltipPosition} />}
        </IconButton>
      ) : (
        <IconButton className={hoverClass}>
          {position === 'left' ? <IoMenuSharp /> : <IoListSharp />}
        </IconButton>
      )}
    </div>
  );
};

export default PanelToggle;