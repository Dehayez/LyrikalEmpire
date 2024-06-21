import React from 'react';
import { IoShuffleSharp } from "react-icons/io5";
import './ShuffleButton.scss';

const ShuffleButton = ({ shuffle, setShuffle }) => {
  return (
    <button className="icon-button icon-button--shuffle" onClick={() => setShuffle(!shuffle)}>
      <IoShuffleSharp style={{ color: shuffle ? '#FFCC44' : '#B3B3B3' }}/>
      <span className="tooltip tooltip--shuffle">{ shuffle ? 'Disable Shuffle' : 'Shuffle' }</span>
    </button>
  );
};

export default ShuffleButton;