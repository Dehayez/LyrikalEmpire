import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IoMenuSharp, IoChevronForwardSharp, IoChevronBackSharp, IoListSharp } from 'react-icons/io5';
import { LeftSidePanel, RightSidePanel } from '../SidePanel'
import './Header.scss';

const Header = ({ isLeftPanelVisible, isRightPanelVisible, toggleSidePanel, handleMouseEnterLeft, handleMouseLeaveLeft, handleMouseEnterRight, handleMouseLeaveRight, isLeftDivVisible, isRightDivVisible }) => {
  const [isSidePanelInContent, setIsSidePanelInContent] = useState(false);

  // LEFT SIDE PANEL
  const handleClickLeft = () => {
    toggleSidePanel('left');
  };


  // RIGHT SIDE PANEL
  const handleClickRight = () => {
    toggleSidePanel('right');
  };


  return (
    <header className="header">
     
      <div onMouseEnter={handleMouseEnterLeft} onMouseLeave={handleMouseLeaveLeft} onClick={handleClickLeft} className="header__nav-menu-left">
        {isLeftPanelVisible ? <IoChevronBackSharp /> : isLeftDivVisible ? <IoChevronForwardSharp /> : <IoMenuSharp />}
      </div>
      <LeftSidePanel className='left-side-panel--hover' isDivVisible={isLeftDivVisible && !isSidePanelInContent} handleMouseEnter={handleMouseEnterLeft} handleMouseLeave={handleMouseLeaveLeft}/>
      
      <div className="header__nav-group">
        <Link to="/">
          <img className="header__nav-logo" src="/android-chrome-192x192.png" alt="Logo" />
        </Link>
      </div>

      <div onMouseEnter={handleMouseEnterRight} onMouseLeave={handleMouseLeaveRight} onClick={handleClickRight} className="header__nav-menu-right">
        {isRightPanelVisible ? <IoChevronForwardSharp /> : isRightDivVisible ? <IoChevronBackSharp /> : <IoListSharp />}
      </div>
      <RightSidePanel className='right-side-panel--hover' isDivVisible={isRightDivVisible && !isSidePanelInContent} handleMouseEnter={handleMouseEnterRight} handleMouseLeave={handleMouseLeaveRight}/>
    </header>
  );
};

export default Header;