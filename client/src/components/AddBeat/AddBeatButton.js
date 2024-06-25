import React from 'react';
import { IoAdd } from 'react-icons/io5';
import './AddBeatButton.scss';

function AddBeatButton({ setIsOpen, isRightPanelVisible, isRightDivVisible }) {
  const buttonStyle = isRightPanelVisible || isRightDivVisible ? { right: '380px' } : { right: '30px' };

  return (
    <button className="icon-button icon-button--addbeat" style={buttonStyle} onClick={() => setIsOpen(true)}>
      <span className="tooltip tooltip__addbeat">Add Beat</span>
      <IoAdd/>
    </button>
  );
}

export default AddBeatButton;