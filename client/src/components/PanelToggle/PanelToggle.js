import React from 'react';
import classNames from 'classnames';
import { LeftPanelHide, LeftPanelOpen, RightPanelHide, RightPanelOpen, Playlists, PlaylistsFill, Queue02, QueueFill } from '../../assets/icons';
import { IconButton } from '../Buttons';
import { isMobileOrTablet } from '../../utils';

import './PanelToggle.scss';

const PanelToggle = ({
  active,
  isPanelVisible,
  isDivVisible,
  isHovered,
  setHovered,
  handleMouseEnter,
  handleMouseLeave,
  handleClick,
  position,
  bottomLabel,
  className,
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
      className={classNames(
        'panel-toggle',
        `panel-toggle--${position}`,
        { 'panel-toggle--mobile': isMobileOrTablet() },
        className
      )}
    >
      <IconButton
        className={hoverClass}
        text={
          isHovered
            ? `${position === 'left' ? (isPanelVisible ? 'Close Playlists' : 'Open Playlists') : isPanelVisible ? 'Close Queue' : 'Open Queue'}`
            : `${position === 'left' ? 'Playlists' : 'Queue'}`
        }
        tooltipPosition={tooltipPosition}
        ariaLabel={
          isHovered
            ? `${position === 'left' ? (isPanelVisible ? 'Close Playlists' : 'Open Playlists') : isPanelVisible ? 'Close Queue' : 'Open Queue'}`
            : `${position === 'left' ? 'Playlists' : 'Queue'}`
        }
        bottomLabel={bottomLabel}
        active={active}
      >
        {isHovered
          ? position === 'left'
            ? isPanelVisible
              ? <LeftPanelHide />
              : <LeftPanelOpen />
            : isPanelVisible
            ? <RightPanelHide />
            : <RightPanelOpen />
          : active
          ? position === 'left'
            ? <PlaylistsFill />
            : <QueueFill />
          : position === 'left'
          ? <Playlists />
          : <Queue02 />}
      </IconButton>
    </div>
  );
};

export default PanelToggle;