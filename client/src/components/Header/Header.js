import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isMobileOrTablet } from '../../utils';
import { IoMenuSharp, IoListSharp, IoLockOpen, IoLockClosed } from 'react-icons/io5';
import { IconButton, NavigationButtons } from '../Buttons';
import { Breadcrumb } from '../Breadcrumb';
import { Tooltip } from '../Tooltip';

import './Header.scss';

const Header = ({ isLeftPanelVisible, isRightPanelVisible, toggleSidePanel, handleMouseEnterLeft, handleMouseLeaveLeft, handleMouseEnterRight, handleMouseLeaveRight, isLeftDivVisible, isRightDivVisible, isAuthPage, closeSidePanel }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  const handleClickLeft = () => {
    if (isMobileOrTablet() && isRightPanelVisible) {
      toggleSidePanel('right');
    }
    toggleSidePanel('left');
  };

  const handleClickRight = () => {
    if (isMobileOrTablet() && isLeftPanelVisible) {
      toggleSidePanel('left');
    }
    toggleSidePanel('right');
  };

  const handleHomepageClick = () => {
      if (!isMobileOrTablet) {
        closeSidePanel('both');
      }
  };

  return (
    <header className="header">
      {!isAuthPage && 
        <div {...(!isMobileOrTablet() ? { onMouseEnter: handleMouseEnterLeft, onMouseLeave: handleMouseLeaveLeft } : {})} onClick={handleClickLeft} className="header__nav-menu-left">
          {
            isLeftPanelVisible ? (
              <IconButton className={isMobileOrTablet() ? 'icon-button--mobile' : ''}>
                <IoLockClosed />
                {!isMobileOrTablet() && <Tooltip text="Unlock Panel" position="right" />}
              </IconButton>
            ) : isLeftDivVisible ? (
              <IconButton>
                <IoLockOpen />
                {!isMobileOrTablet() && <Tooltip text="Lock Panel" position="right" />}
              </IconButton>
            ) : (
              <IconButton className={isMobileOrTablet() ? 'icon-button--mobile' : ''}>
                <IoMenuSharp />
              </IconButton>
            )
          }
        </div>
    }

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

      {!isAuthPage && 
        <div {...(!isMobileOrTablet() ? { onMouseEnter: handleMouseEnterRight, onMouseLeave: handleMouseLeaveRight } : {})} onClick={handleClickRight} className="header__nav-menu-right">
          {
            isRightPanelVisible ? (
              <IconButton className={isMobileOrTablet() ? 'icon-button--mobile' : ''}>
                <IoLockClosed />
                {!isMobileOrTablet() && <Tooltip text="Unlock Panel" position="left" />}
              </IconButton>
            ) : isRightDivVisible ? (
              <IconButton>
                <IoLockOpen />
                {!isMobileOrTablet() && <Tooltip text="Lock Panel" position="left" />}
              </IconButton>
            ) : (
              <IconButton className={isMobileOrTablet() ? 'icon-button--mobile' : ''}>
                <IoListSharp />
              </IconButton>
            )
          }
        </div>
      }
  </header>
  );
};

export default Header;