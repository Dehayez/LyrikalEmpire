import React from 'react';
import './SidePanel.scss';

const RightSidePanel = ({ isDivVisible, handleMouseEnter, handleMouseLeave, className }) => {
    const sidePanelClass = `right-side-panel ${isDivVisible ? 'right-side-panel--visible' : 'right-side-panel--hidden'} ${className}`;
  
    return (
      <div className={sidePanelClass} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <h2>Settings</h2> {/* Example content */}
      </div>
    );
  };

export default RightSidePanel;