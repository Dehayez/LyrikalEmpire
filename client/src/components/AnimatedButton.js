import React, { useState } from 'react';

const AnimatedButton = ({ children, className, onClick, animationClass, style }) => {
  const [animate, setAnimate] = useState(false);

  const handleInteractionStart = () => {
    setAnimate(true);
  };

  const handleInteractionEnd = () => {
    setAnimate(false);
  };

  return (
    <button 
      className={`${className} ${animate ? animationClass : ''}`} 
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
};

export default AnimatedButton;