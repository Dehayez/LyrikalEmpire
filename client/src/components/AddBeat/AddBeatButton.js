import React from 'react';
import { IoAddSharp } from 'react-icons/io5';
import IconButton from '../Buttons/IconButton';
import './AddBeatButton.scss';

function AddBeatButton({ setIsOpen, isRightPanelVisible, isRightDivVisible }) {
  const buttonClass = isRightPanelVisible || isRightDivVisible ? 'button-slide-in' : 'button-slide-out';

  return (
    <IconButton
      className={`icon-button--addbeat ${buttonClass}`}
      onClick={() => setIsOpen(true)}
      text="Add Track"
      tooltipPosition="left"
    >
      <IoAddSharp />
    </IconButton>
  );
}

export default AddBeatButton;