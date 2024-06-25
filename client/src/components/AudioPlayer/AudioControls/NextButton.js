import React, { useState, useEffect } from 'react';
import { IoPlaySkipForwardSharp } from "react-icons/io5";
import './NextButton.scss';

const NextButton = ({ onNext }) => {
  const [isNextActive, setIsNextActive] = useState(false);

  useEffect(() => {
    // Media Session API integration
    const setMediaSession = () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          setIsNextActive(true);
          onNext();
          // Simulate keyUp effect
          setTimeout(() => setIsNextActive(false), 200);
        });
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight' || event.code === 'MediaTrackNext') {
        setIsNextActive(true);
        onNext();
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'ArrowRight' || event.code === 'MediaTrackNext') {
        setIsNextActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    setMediaSession();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      // Reset Media Session action handler to null when component unmounts
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [onNext]);

  return (
    <button 
      className={`icon-button icon-button--next ${isNextActive ? 'active' : ''}`} 
      onMouseDown={() => setIsNextActive(true)}
      onMouseUp={() => setIsNextActive(false)}
      onMouseLeave={() => setIsNextActive(false)}
      onClick={onNext}
    >
      <span className="tooltip">Next</span>
      <IoPlaySkipForwardSharp size={24} />
    </button>
  );
};

export default NextButton;