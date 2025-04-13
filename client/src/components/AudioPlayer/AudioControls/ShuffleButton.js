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
      ariaLabel={shuffle ? 'Disable Shuffle' : 'Enable Shuffle'}
    >
      <IoShuffleSharp />
    </IconButton>
  );
};

export default ShuffleButton;