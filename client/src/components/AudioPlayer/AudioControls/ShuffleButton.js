import React from 'react';
import { IoShuffleSharp } from "react-icons/io5";

import { Tooltip } from '../../Tooltip';

import './ShuffleButton.scss';

const ShuffleButton = ({ shuffle, setShuffle }) => {
  return (
    <button className={`icon-button icon-button--shuffle ${shuffle ? 'active' : ''}`} onClick={() => setShuffle(!shuffle)}>
      <IoShuffleSharp />
      <Tooltip text={shuffle ? 'Disable Shuffle' : 'Shuffle'} />
    </button>
  );
};

export default ShuffleButton;