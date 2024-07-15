import React from 'react';
import { IoAddSharp } from 'react-icons/io5';
import './AddBeatButton.scss';

function AddBeatButton({ setIsOpen, isRightPanelVisible, isRightDivVisible }) {
  const buttonClass = isRightPanelVisible || isRightDivVisible ? 'button-slide-in' : 'button-slide-out';

  return (
    <div className={`icon-button icon-button--addbeat ${buttonClass}`} onClick={() => setIsOpen(true)}>
      <span className="tooltip tooltip--left tooltip--addbeat">Add Track</span>
      <IoAddSharp />
    </div>
  );
}

export default AddBeatButton;