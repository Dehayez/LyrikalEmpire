import React from 'react';
import './SidePanel.scss';

const LeftSidePanel = ({ isDivVisible, handleMouseEnter, handleMouseLeave, className, children }) => {
    const sidePanelClass = `left-side-panel ${isDivVisible ? 'left-side-panel--visible' : 'left-side-panel--hidden'} ${className}`;
  
    return (
      <div className={sidePanelClass} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        { children }
      </div>
    );
  };

export default LeftSidePanel;