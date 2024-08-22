import React from 'react';
import { IoAddSharp } from 'react-icons/io5';
import { Tooltip } from '../Tooltip';
import './AddBeatButton.scss';

function AddBeatButton({ setIsOpen, isRightPanelVisible, isRightDivVisible }) {
  const buttonClass = isRightPanelVisible || isRightDivVisible ? 'button-slide-in' : 'button-slide-out';

  return (
    <div className={`icon-button icon-button--addbeat ${buttonClass}`} onClick={() => setIsOpen(true)}>
      <Tooltip text="Add Track" position='left' />
      <IoAddSharp />
    </div>
  );
}

export default AddBeatButton;