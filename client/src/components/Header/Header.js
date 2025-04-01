import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isMobileOrTablet } from '../../utils';
import { IoMenuSharp, IoListSharp, IoLockOpen, IoLockClosed } from 'react-icons/io5';
import { IconButton, NavigationButtons } from '../Buttons';
import { Breadcrumb } from '../Breadcrumb';
import { Tooltip } from '../Tooltip';

import './Header.scss';

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
      className={`header__nav-menu-${position}`}
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

const Header = ({
  isLeftPanelVisible,
  isRightPanelVisible,
  toggleSidePanel,
  handleMouseEnterLeft,
  handleMouseLeaveLeft,
  handleMouseEnterRight,
  handleMouseLeaveRight,
  isLeftDivVisible,
  isRightDivVisible,
  isAuthPage,
  closeSidePanel,
}) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);

  const handleClickPanel = (panel) => {
    if (isMobileOrTablet()) {
      if (panel === 'left' && isRightPanelVisible) toggleSidePanel('right');
      if (panel === 'right' && isLeftPanelVisible) toggleSidePanel('left');
    }
    toggleSidePanel(panel);
  };

  const handleHomepageClick = () => {
    if (!isMobileOrTablet()) closeSidePanel('both');
  };

  return (
    <header className="header">
      {!isAuthPage && (
        <PanelToggle
          isPanelVisible={isLeftPanelVisible}
          isDivVisible={isLeftDivVisible}
          isHovered={isLeftHovered}
          setHovered={setIsLeftHovered}
          handleMouseEnter={handleMouseEnterLeft}
          handleMouseLeave={handleMouseLeaveLeft}
          handleClick={() => handleClickPanel('left')}
          position="left"
        />
      )}

      {isDashboard && (
        <>
          <NavigationButtons />
          <Breadcrumb />
        </>
      )}

      <div className="header__nav-group" onClick={handleHomepageClick}>
        <Link to="/">
          <img className="header__nav-logo" src="/android-chrome-192x192.png" alt="Logo" />
        </Link>
      </div>

      {!isAuthPage && (
        <PanelToggle
          isPanelVisible={isRightPanelVisible}
          isDivVisible={isRightDivVisible}
          isHovered={isRightHovered}
          setHovered={setIsRightHovered}
          handleMouseEnter={handleMouseEnterRight}
          handleMouseLeave={handleMouseLeaveRight}
          handleClick={() => handleClickPanel('right')}
          position="right"
        />
      )}
    </header>
  );
};

export default Header;