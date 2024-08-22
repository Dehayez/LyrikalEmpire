import React from 'react';
import { IoRepeatSharp } from "react-icons/io5";

import { Tooltip } from '../../Tooltip';

import './RepeatButton.scss';

const RepeatButton = ({ repeat, setRepeat }) => {
  return (
    <div className={`icon-button icon-button--repeat ${repeat !== 'Disabled Repeat' ? 'active' : ''}`} onClick={() => setRepeat(prev => prev === 'Disabled Repeat' ? 'Repeat' : prev === 'Repeat' ? 'Repeat One' : 'Disabled Repeat')}>
      <Tooltip text={repeat === 'Disabled Repeat' ? 'Repeat' : repeat === 'Repeat' ? 'Repeat One' : 'Disable Repeat'} position="repeat" />
      {repeat === 'Disabled Repeat' ? <IoRepeatSharp/> : repeat === 'Repeat' ? <IoRepeatSharp/> : <IoRepeatSharp/>}
      {repeat === 'Repeat One' && <div className="repeat-one-indicator"></div>}
    </div>
  );
};

export default RepeatButton;