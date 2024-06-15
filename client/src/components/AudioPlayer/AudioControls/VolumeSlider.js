import React from 'react';
import { IoVolumeMuteSharp, IoVolumeMediumSharp, IoVolumeHighSharp, IoVolumeLowSharp } from "react-icons/io5";
import './VolumeSlider.scss';

const VolumeSlider = ({ volume, handleVolumeChange }) => {
  return (
    <div className='volume-slider' style={{ flex: '1' }}>
      {volume > 0.66 && <IoVolumeHighSharp size={22} />}
      {volume > 0.33 && volume <= 0.66 && <IoVolumeMediumSharp size={22} />}
      {volume > 0 && volume <= 0.33 && <IoVolumeLowSharp size={22} />}
      {volume === 0 && <IoVolumeMuteSharp size={22} />}
      <input 
        type="range" 
        className='volume-slider__input'
        min="0" 
        max="1" 
        step="0.01" 
        value={volume} 
        onChange={handleVolumeChange} 
      />
    </div>
  );
};

export default VolumeSlider;