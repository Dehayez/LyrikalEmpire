import React from 'react';
import './SidePanel.scss';

const SidePanel = ({ isDivVisible, handleMouseEnter, handleMouseLeave, className }) => {
  const sidePanelClass = `side-panel ${isDivVisible ? 'side-panel--visible' : 'side-panel--hidden'} ${className}`;

  return (
    <div className={sidePanelClass} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <h2>Playlists</h2>
    </div>
  );
};

export default SidePanel;