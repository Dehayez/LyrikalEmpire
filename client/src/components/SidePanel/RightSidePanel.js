import React from 'react';
import './SidePanel.scss';

const RightSidePanel = ({ isDivVisible, handleMouseEnter, handleMouseLeave, className, children }) => {
    const sidePanelClass = `right-side-panel ${isDivVisible ? 'right-side-panel--visible' : 'right-side-panel--hidden'} ${className}`;

    return (
      <>
        <div className="invisible-hover-area invisible-hover-area--right" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}></div>
        <div className={sidePanelClass} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {children}
        </div>
      </>
    );
};

export default RightSidePanel;