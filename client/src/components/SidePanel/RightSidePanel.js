import React from 'react';
import './SidePanel.scss';

const RightSidePanel = ({ isDivVisible, handleMouseEnter, handleMouseLeave, className, children }) => {
    const sidePanelClass = `right-side-panel ${isDivVisible ? 'right-side-panel--visible' : 'right-side-panel--hidden'} ${className}`;
  
    return (
      <div className={sidePanelClass} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </div>
    );
  };

export default RightSidePanel;