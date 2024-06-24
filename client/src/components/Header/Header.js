import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IoMenuSharp, IoChevronForwardSharp, IoChevronBackSharp, IoSettingsSharp } from 'react-icons/io5';
import { SidePanel } from '../SidePanel';
import { LeftSidePanel, RightSidePanel } from '../SidePanel'
import './Header.scss';

const Header = ({ isSidePanelInContent, toggleSidePanel }) => {

// Updated handlers for left side panel with renamed functions to reflect "left"
const handleMouseEnterLeft = () => {
  if (!isSidePanelInContent) {
    hoverRefLeft.current = true;
    setIsLeftDivVisible(true);
  }
};

const handleMouseLeaveLeft = () => {
  if (!isSidePanelInContent) {
    hoverRefLeft.current = false;
    setTimeout(() => {
      if (!hoverRefLeft.current) {
        setIsLeftDivVisible(false);
      }
    }, 300);
  }
};



// Added handlers for right side panel with opposite logic for "right"
const handleMouseEnterRight = () => {
  if (!isSidePanelInContent) {
    hoverRefRight.current = true;
    setIsRightDivVisible(true);
  }
};

const handleMouseLeaveRight = () => {
  if (!isSidePanelInContent) {
    hoverRefRight.current = false;
    setTimeout(() => {
      if (!hoverRefRight.current) {
        setIsRightDivVisible(false);
      }
    }, 300);
  }
};

const handleClickLeft = () => {
  toggleSidePanel('left');
};

const handleClickRight = () => {
  toggleSidePanel('right');
};
  const [isLeftDivVisible, setIsLeftDivVisible] = useState(false);
  const [isRightDivVisible, setIsRightDivVisible] = useState(false);
  const hoverRefLeft = useRef(false);
  const hoverRefRight = useRef(false);

  return (
    <header className="header">
      <div onMouseEnter={handleMouseEnterLeft} onMouseLeave={handleMouseLeaveLeft} onClick={handleClickLeft} className="header__nav-menu-left">
        {isSidePanelInContent ? <IoChevronBackSharp /> : isLeftDivVisible ? <IoChevronForwardSharp /> : <IoMenuSharp />}
      </div>
      <LeftSidePanel className='left-side-panel--hover' isDivVisible={isLeftDivVisible && !isSidePanelInContent} handleMouseEnter={handleMouseEnterLeft} handleMouseLeave={handleMouseLeaveLeft}/>
      <div onMouseEnter={handleMouseEnterRight} onMouseLeave={handleMouseLeaveRight} onClick={handleClickRight} className="header__nav-menu-right">
        <IoSettingsSharp />
      </div>
      <RightSidePanel className='right-side-panel--hover' isDivVisible={isRightDivVisible && !isSidePanelInContent} handleMouseEnter={handleMouseEnterRight} handleMouseLeave={handleMouseLeaveRight}/>
      <div className="header__nav-group">
        <Link to="/">
          <img className="header__nav-logo" src="/android-chrome-192x192.png" alt="Logo" />
        </Link>
      </div>
    </header>
  );
};

export default Header;