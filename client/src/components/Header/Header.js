import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IoMenuSharp, IoChevronForwardSharp, IoChevronBackSharp, IoSettingsSharp } from 'react-icons/io5';
import { LeftSidePanel, RightSidePanel } from '../SidePanel'
import './Header.scss';

const Header = ({ isLeftPanelVisible, isRightPanelVisible, toggleSidePanel, isSidePanelInContent }) => {
  const [isLeftDivVisible, setIsLeftDivVisible] = useState(false);
  const [isRightDivVisible, setIsRightDivVisible] = useState(false);
  const hoverRefLeft = useRef(false);
  const hoverRefRight = useRef(false);

  // LEFT SIDE PANEL
  const handleClickLeft = () => {
    toggleSidePanel('left');
  };
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

  // RIGHT SIDE PANEL
  const handleClickRight = () => {
    toggleSidePanel('right');
  };

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

  return (
    <header className="header">
     
      <div onMouseEnter={handleMouseEnterLeft} onMouseLeave={handleMouseLeaveLeft} onClick={handleClickLeft} className="header__nav-menu-left">
        {isSidePanelInContent ? <IoChevronBackSharp /> : isLeftDivVisible ? <IoChevronForwardSharp /> : <IoMenuSharp />}
      </div>
      <RightSidePanel className='right-side-panel--hover' isDivVisible={isRightDivVisible && !isSidePanelInContent} handleMouseEnter={handleMouseEnterRight} handleMouseLeave={handleMouseLeaveRight}/>
      <div className="header__nav-group">
        <Link to="/">
          <img className="header__nav-logo" src="/android-chrome-192x192.png" alt="Logo" />
        </Link>
      </div>

      <div onMouseEnter={handleMouseEnterRight} onMouseLeave={handleMouseLeaveRight} onClick={handleClickRight} className="header__nav-menu-right">
        <IoSettingsSharp />
      </div>
      <LeftSidePanel className='left-side-panel--hover' isDivVisible={isLeftDivVisible && !isSidePanelInContent} handleMouseEnter={handleMouseEnterLeft} handleMouseLeave={handleMouseLeaveLeft}/>
    </header>
  );
};

export default Header;