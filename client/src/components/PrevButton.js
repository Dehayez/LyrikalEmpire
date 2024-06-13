import React, { useState } from 'react';
import { IoPlaySkipBackSharp } from "react-icons/io5";

const PrevButton = ({ onPrev }) => {
  const [isPrevActive, setIsPrevActive] = useState(false);

  return (
    <button 
      className={`icon-button icon-button__prev ${isPrevActive ? 'active' : ''}`} 
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