import React, { useState } from 'react';
import { IoPlaySkipForwardSharp } from "react-icons/io5";

const NextButton = ({ onNext }) => {
  const [isNextActive, setIsNextActive] = useState(false);

  return (
    <button 
      className={`icon-button icon-button__next ${isNextActive ? 'active' : ''}`} 
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