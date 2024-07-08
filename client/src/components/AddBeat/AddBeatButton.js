import React from 'react';
import { IoAddSharp } from 'react-icons/io5';
import './AddBeatButton.scss';

function AddBeatButton({ setIsOpen, isRightPanelVisible, isRightDivVisible }) {
  const buttonClass = isRightPanelVisible || isRightDivVisible ? 'button-slide-in' : 'button-slide-out';

  return (
    <button className={`icon-button icon-button--addbeat ${buttonClass}`} onClick={() => setIsOpen(true)}>
      <span className="tooltip tooltip--left tooltip__addbeat">Add Beat</span>
      <div className='icon-button'><IoAddSharp /></div>
    </button>
  );
}

export default AddBeatButton;