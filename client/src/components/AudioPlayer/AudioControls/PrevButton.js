import React, { useState, useEffect } from 'react';
import { IoPlaySkipBackSharp } from "react-icons/io5";
import './PrevButton.scss';

const PrevButton = ({ onPrev }) => {
  const [isPrevActive, setIsPrevActive] = useState(false);

  useEffect(() => {
    // Media Session API integration
    const setMediaSession = () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          setIsPrevActive(true);
          onPrev();
          // Simulate keyUp effect
          setTimeout(() => setIsPrevActive(false), 200);
        });
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft' || event.code === 'MediaTrackPrevious') {
        setIsPrevActive(true);
        onPrev();
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'ArrowLeft' || event.code === 'MediaTrackPrevious') {
        setIsPrevActive(false);
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
        navigator.mediaSession.setActionHandler('previoustrack', null);
      }
    };
  }, [onPrev]);

  return (
    <button 
      className={`icon-button icon-button--prev ${isPrevActive ? 'active' : ''}`} 
      onMouseDown={() => setIsPrevActive(true)}
      onMouseUp={() => setIsPrevActive(false)}
      onMouseLeave={() => setIsPrevActive(false)}
      onClick={onPrev}
    >
      <span className="tooltip">Previous</span>
      <IoPlaySkipBackSharp size={24} />
    </button>
  );
};

export default PrevButton;