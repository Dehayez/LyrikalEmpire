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

  const getSessionDisplayName = (sessionId) => {
    if (!sessionId) return 'Unknown';
    const parts = sessionId.split('_');
    return `Tab ${parts[1]?.slice(-4) || 'Unknown'}`;
  };

  const isThisTab = isCurrentSessionMaster;
  const masterDisplayName = getSessionDisplayName(masterSession);

  return (
    <div className={`playing-indicator ${isThisTab ? 'playing-indicator--current' : 'playing-indicator--remote'}`}>
      <div className="playing-indicator__icon">
        {isThisTab ? '🎵' : '📻'}
      </div>
      <div className="playing-indicator__text">
        {isThisTab ? (
          <span className="playing-indicator__label">Playing on this tab</span>
        ) : (
          <span className="playing-indicator__label">
            Playing on {masterDisplayName}
          </span>
        )}
      </div>
      <div className="playing-indicator__pulse"></div>
    </div>
  );
};

export default PlayingIndicator; 