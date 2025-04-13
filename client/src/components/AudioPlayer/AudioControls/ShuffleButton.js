import React from 'react';
import { IoShuffleSharp } from "react-icons/io5";
import IconButton from '../../Buttons/IconButton';
import './ShuffleButton.scss';

const ShuffleButton = ({ shuffle, setShuffle }) => {
  return (
    <IconButton
      className={`icon-button--shuffle ${shuffle ? 'active' : ''}`}
      onClick={() => setShuffle(!shuffle)}
      text={shuffle ? 'Disable Shuffle' : 'Shuffle'}
      tooltipPosition="top"
    >
      <IoShuffleSharp />
    </IconButton>
  );
};

export default ShuffleButton;