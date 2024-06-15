import React, { useRef, useEffect, useState } from 'react';
import { IoVolumeMuteSharp, IoVolumeMediumSharp, IoVolumeHighSharp, IoVolumeLowSharp } from "react-icons/io5";
import './VolumeSlider.scss';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const VolumeSlider = ({ volume, handleVolumeChange }) => {
  const sliderRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (event) => {
    if (!isDragging) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const newVolume = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    handleVolumeChange({ target: { value: newVolume } });
  }

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isDragging]);

  return (
    <div className='volume-slider' style={{ flex: '1' }}>
      <div className='volume-slider__icon'>
        {volume > 0.66 && <IoVolumeHighSharp size={22} />}
        {volume > 0.33 && volume <= 0.66 && <IoVolumeMediumSharp size={22} />}
        {volume > 0 && volume <= 0.33 && <IoVolumeLowSharp size={22} />}
        {volume === 0 && <IoVolumeMuteSharp size={22} />}
      </div>
      <div 
        className='volume-slider__track'
        ref={sliderRef}
        onMouseDown={() => setIsDragging(true)}
      >
        <div
          className='volume-slider__progress'
          style={{ width: `${volume * 100}%` }}
        />
        <div 
          className='volume-slider__thumb'
          style={{ left: `${volume * 100}%` }}
        />
      </div>
    </div>
  );
};

export default VolumeSlider;