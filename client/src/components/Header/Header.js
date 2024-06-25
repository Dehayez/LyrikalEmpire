import React from 'react';
import { Link } from 'react-router-dom';
import { IoMenuSharp, IoChevronForwardSharp, IoChevronBackSharp, IoListSharp } from 'react-icons/io5';
import './Header.scss';

const Header = ({ isLeftPanelVisible, isRightPanelVisible, toggleSidePanel, handleMouseEnterLeft, handleMouseLeaveLeft, handleMouseEnterRight, handleMouseLeaveRight, isLeftDivVisible, isRightDivVisible }) => {
  const handleClickLeft = () => {
    toggleSidePanel('left');
  };

  const handleClickRight = () => {
    toggleSidePanel('right');
  };


  return (
    <header className="header">
     
      <div onMouseEnter={handleMouseEnterLeft} onMouseLeave={handleMouseLeaveLeft} onClick={handleClickLeft} className="header__nav-menu-left">
        {isLeftPanelVisible ? <IoChevronBackSharp /> : isLeftDivVisible ? <IoChevronForwardSharp /> : <IoMenuSharp />}
      </div>
      
      <div className="header__nav-group">
        <Link to="/">
          <img className="header__nav-logo" src="/android-chrome-192x192.png" alt="Logo" />
        </Link>
      </div>

      <div onMouseEnter={handleMouseEnterRight} onMouseLeave={handleMouseLeaveRight} onClick={handleClickRight} className="header__nav-menu-right">
        {isRightPanelVisible ? <IoChevronForwardSharp /> : isRightDivVisible ? <IoChevronBackSharp /> : <IoListSharp />}
      </div>
    </header>
  );
};

export default Header;