import React from 'react';
import './SidePanel.scss';

const SidePanel = ({ isDivVisible, isSidePanelInContent, handleMouseEnter, handleMouseLeave }) => {
  const sidePanelClass = `side-panel ${isDivVisible || isSidePanelInContent ? 'side-panel--visible' : 'side-panel--hidden'}`;

  return (
    <div className={sidePanelClass} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <h2>Playlists</h2>
    </div>
  );
};

export default SidePanel;