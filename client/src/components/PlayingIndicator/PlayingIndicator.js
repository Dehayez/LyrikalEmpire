import React from 'react';
import './PlayingIndicator.scss';
import { IoHeadsetSharp } from "react-icons/io5";

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
    <div className="playing-indicator">
        <span className="playing-indicator__label">
          <IoHeadsetSharp /> Playing on {masterDisplayName}
        </span>
    </div>
  );
};

export default PlayingIndicator; 