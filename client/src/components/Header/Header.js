import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IoMenuSharp, IoChevronForwardSharp, IoChevronBackSharp } from 'react-icons/io5';
import { SidePanel } from '../SidePanel';
import './Header.scss';

const Header = ({ isSidePanelInContent, toggleSidePanel }) => {
  const [isDivVisible, setIsDivVisible] = useState(false);
  const hoverRef = useRef(false);

  const handleMouseEnter = () => {
    if (!isSidePanelInContent) {
      hoverRef.current = true;
      setIsDivVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isSidePanelInContent) {
      hoverRef.current = false;
      setTimeout(() => {
        if (!hoverRef.current) {
          setIsDivVisible(false);
        }
      }, 300);
    }
  };

  const handleClick = () => {
    setIsDivVisible(false); // Hide the SidePanel in Header on click
    toggleSidePanel(); // Toggle visibility for the SidePanel in App.js
  };

  return (
    <header className="header">
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick} className="header__nav-menu">
        {isSidePanelInContent ? <IoChevronBackSharp /> : isDivVisible ? <IoChevronForwardSharp /> : <IoMenuSharp />}
      </div>
      <SidePanel isDivVisible={isDivVisible && !isSidePanelInContent} isSidePanelInContent={isSidePanelInContent} handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave}/>
      <div className="header__nav-group">
        <Link to="/">
          <img className="header__nav-logo" src="/android-chrome-192x192.png" alt="Logo" />
        </Link>
      </div>
    </header>
  );
};

export default Header;