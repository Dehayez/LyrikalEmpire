import React from 'react';
import './PlayingIndicator.scss';

const PlayingIndicator = ({ 
  masterSession, 
  currentSessionId, 
  isCurrentSessionMaster, 
  isPlaying,
  currentBeat 
}) => {
  if (!isPlaying || !currentBeat) {
    return null;
  }

  // Only show indicator on OTHER tabs/browsers, not the one currently playing
  if (isCurrentSessionMaster) {
    return null;
  }

  const getSessionDisplayName = (sessionId) => {
    if (!sessionId) return 'Unknown';
    const parts = sessionId.split('_');
    return `Tab ${parts[1]?.slice(-4) || 'Unknown'}`;
  };

  const masterDisplayName = getSessionDisplayName(masterSession);

  return (
    <div className="playing-indicator playing-indicator--remote">
      <div className="playing-indicator__icon">
        📻
      </div>
      <div className="playing-indicator__text">
        <span className="playing-indicator__label">
          Playing on {masterDisplayName}
        </span>
      </div>
      <div className="playing-indicator__pulse"></div>
    </div>
  );
};

export default PlayingIndicator; 