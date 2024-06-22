import React, { useState } from 'react';
import { IoMenuSharp, IoChevronForwardSharp } from 'react-icons/io5';
import './Header.scss';

const Header = () => {
  const [isDivVisible, setIsDivVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsDivVisible(true);
  };
  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsDivVisible(false);
  };

  // Determine the class for the side panel based on visibility and hovering
  const sidePanelClass = `side-panel ${isDivVisible && isHovering ? 'side-panel--visible' : 'side-panel--hidden'}`;

  return (
    <header className="header">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="header__nav-menu"
      >
        {isHovering ? <IoChevronForwardSharp /> : <IoMenuSharp />}
      </div>
      <div
        className={sidePanelClass}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Content of the div */}
      </div>
      <div className="header__nav-group">
        <img className="header__nav-logo" src="/android-chrome-192x192.png" alt="Logo" />
      </div>
    </header>
  );
};

export default Header;