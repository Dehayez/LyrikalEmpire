import React from 'react';
import { IoRepeatSharp } from "react-icons/io5";
import './RepeatButton.scss';

const RepeatButton = ({ repeat, setRepeat }) => {
  return (
    <button className="icon-button icon-button--repeat" onClick={() => setRepeat(prev => prev === 'Disabled Repeat' ? 'Repeat' : prev === 'Repeat' ? 'Repeat One' : 'Disabled Repeat')}>
      { repeat === 'Disabled Repeat' ? <IoRepeatSharp style={{ color: '#B3B3B3' }}/> : repeat === 'Repeat' ? <IoRepeatSharp style={{ color: '#FFCC44' }}/> : <IoRepeatSharp style={{ color: '#FFCC44' }}/> }
      { repeat === 'Repeat One' && <div className="repeat-one-indicator"></div> }
      <span className="tooltip tooltip--repeat">{ repeat === 'Disabled Repeat' ? 'Repeat' : repeat === 'Repeat' ? 'Repeat One' : 'Disable Repeat' }</span>
    </button>
  );
};

export default RepeatButton;