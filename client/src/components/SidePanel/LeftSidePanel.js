import React from 'react';
import './SidePanel.scss';

const LeftSidePanel = ({ isDivVisible, handleMouseEnter, handleMouseLeave, className }) => {
    const sidePanelClass = `left-side-panel ${isDivVisible ? 'left-side-panel--visible' : 'left-side-panel--hidden'} ${className}`;
  
    return (
      <div className={sidePanelClass} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <h2>Playlists</h2>
      </div>
    );
  };

export default LeftSidePanel;