import React from 'react';
import { Link } from 'react-router-dom';
import { isMobileOrTablet } from '../../utils';
import { IoMenuSharp, IoChevronForwardSharp, IoChevronBackSharp, IoListSharp, IoAnalytics } from 'react-icons/io5';
import { IconButton, NavigationButtons } from '../Buttons';

import './Header.scss';

const Header = ({ isLeftPanelVisible, isRightPanelVisible, toggleSidePanel, handleMouseEnterLeft, handleMouseLeaveLeft, handleMouseEnterRight, handleMouseLeaveRight, isLeftDivVisible, isRightDivVisible }) => {
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

  return (
    <header className="header">
      <div {...(!isMobileOrTablet() ? { onMouseEnter: handleMouseEnterLeft, onMouseLeave: handleMouseLeaveLeft } : {})} onClick={handleClickLeft} className="header__nav-menu-left">
        {
          isLeftPanelVisible ? <div className={`icon-button ${isMobileOrTablet() ? 'icon-button--mobile' : ''}`}><IoChevronBackSharp />{!isMobileOrTablet() && <span className="tooltip tooltip--right">Unlock Panel</span>}</div> 
          : isLeftDivVisible ? <div className='icon-button'><IoChevronForwardSharp />{!isMobileOrTablet() && <span className="tooltip tooltip--right">Lock Panel</span>}</div> 
          : <div className={`icon-button ${isMobileOrTablet() ? 'icon-button--mobile' : ''}`}><IoMenuSharp /></div>
        }
      </div>
      <NavigationButtons />
      
      <div className="header__nav-group">
        <Link to="/">
          <img className="header__nav-logo" src="/android-chrome-192x192.png" alt="Logo" />
        </Link>
      </div>

      <Link to="/dashboard" className="header__nav-group-dashboard">
        <IconButton>
          <IoAnalytics />
        </IconButton>
      </Link>

      <div {...(!isMobileOrTablet() ? { onMouseEnter: handleMouseEnterRight, onMouseLeave: handleMouseLeaveRight } : {})} onClick={handleClickRight} className="header__nav-menu-right">
        {
          isRightPanelVisible ?  <div className={`icon-button ${isMobileOrTablet() ? 'icon-button--mobile' : ''}`}><IoChevronForwardSharp />{!isMobileOrTablet() && <span className="tooltip tooltip--left">Unlock Panel</span>}</div> 
          : isRightDivVisible ? <div className='icon-button'><IoChevronBackSharp />{!isMobileOrTablet() && <span className="tooltip tooltip--left">Lock Panel</span>}</div>
          : <div className={`icon-button ${isMobileOrTablet() ? 'icon-button--mobile' : ''}`}><IoListSharp /></div>
        }
      </div>
  </header>
  );
};

export default Header;