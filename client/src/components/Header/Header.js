import React, { useState, useRef } from 'react';
import { IoMenuSharp, IoChevronForwardSharp, IoChevronBackSharp } from 'react-icons/io5';
import './Header.scss';

const Header = ({ isSidePanelInContent, toggleSidePanel }) => {
  const [isDivVisible, setIsDivVisible] = useState(false);
  const hoverRef = useRef(false);

  const handleMouseEnter = () => {
    if (!isSidePanelInContent) { // Only show on hover if not in content mode
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
    toggleSidePanel(); // Toggle side panel mode on click
  };

  const sidePanelClass = `side-panel ${isDivVisible || isSidePanelInContent ? 'side-panel--visible' : 'side-panel--hidden'}`;

  return (
    <header className="header">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="header__nav-menu"
      >
        {isSidePanelInContent ? <IoChevronBackSharp /> : isDivVisible ? <IoChevronForwardSharp /> : <IoMenuSharp />}
      </div>
      <div className={sidePanelClass} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <h2>Playlists</h2>
      </div>
      <div className="header__nav-group">
        <img className="header__nav-logo" src="/android-chrome-192x192.png" alt="Logo" />
      </div>
    </header>
  );
};

export default Header;