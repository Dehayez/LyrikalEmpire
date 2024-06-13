import React, { useState } from 'react';

const AnimatedButton = ({ children, className, onClick, animationClass, style }) => {
  const [animate, setAnimate] = useState(false);

  const handleInteraction = () => {
    setAnimate(!animate);
  };

  return (
    <button 
      className={`${className} ${animate ? animationClass : ''}`} 
      onMouseDown={handleInteraction}
      onMouseUp={handleInteraction}
      onMouseLeave={handleInteraction}
      onTouchStart={handleInteraction}
      onTouchEnd={handleInteraction}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
};

export default AnimatedButton;