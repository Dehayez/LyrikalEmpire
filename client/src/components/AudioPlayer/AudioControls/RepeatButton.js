import React from 'react';
import { IoRepeatSharp } from "react-icons/io5";
import IconButton from '../../Buttons/IconButton';
import './RepeatButton.scss';

const RepeatButton = ({ repeat, setRepeat }) => {
  const handleRepeatClick = () => {
    setRepeat((prev) =>
      prev === 'Disabled Repeat' ? 'Repeat' : prev === 'Repeat' ? 'Repeat One' : 'Disabled Repeat'
    );
  };

  const tooltipText =
    repeat === 'Disabled Repeat'
      ? 'Repeat'
      : repeat === 'Repeat'
      ? 'Repeat One'
      : 'Disable Repeat';

  return (
    <IconButton
      className={`icon-button--repeat ${repeat !== 'Disabled Repeat' ? 'active' : ''}`}
      onClick={handleRepeatClick}
      text={tooltipText}
      ariaLabel={tooltipText}
    >
      <IoRepeatSharp />
      {repeat === 'Repeat One' && <div className="repeat-one-indicator"></div>}
    </IconButton>
  );
};

export default RepeatButton;