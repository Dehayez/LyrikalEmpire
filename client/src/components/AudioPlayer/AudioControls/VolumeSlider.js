import React, { useRef, useEffect, useState } from 'react';
import { IoVolumeMuteSharp, IoVolumeMediumSharp, IoVolumeHighSharp, IoVolumeLowSharp } from "react-icons/io5";

import { Tooltip } from '../../Tooltip';

import './VolumeSlider.scss';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const VolumeSlider = ({ volume, handleVolumeChange }) => {
  const sliderRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  const calculateVolume = (event) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const newVolume = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    handleVolumeChange({ target: { value: newVolume } });
    setIsMuted(newVolume === 0);
  }

  const toggleMute = () => {
    if (volume === 0) {
      handleVolumeChange({ target: { value: prevVolume === 0 ? 1 : prevVolume } });
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      handleVolumeChange({ target: { value: 0 } });
      setIsMuted(true);
    }
  }

  const handleMouseMove = (event) => {
    if (isDragging) calculateVolume(event);
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

  const volumeIcon = volume > 0.66 ? <IoVolumeHighSharp size={24} />
    : volume > 0.33 ? <IoVolumeMediumSharp size={24} />
    : volume > 0 ? <IoVolumeLowSharp size={24} />
    : <IoVolumeMuteSharp size={24} />;

  return (
    <div className='volume-slider'>
      <div className='volume-slider__icon' onClick={toggleMute}>
        {volumeIcon}
        <Tooltip text={isMuted ? 'Unmute' : 'Mute'} />
      </div>
      <div 
        className={`volume-slider__track ${isHovering || isDragging ? 'hover' : ''}`}
        ref={sliderRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          className='volume-slider__progress'
          style={{ width: `${volume * 100}%` }}
        />
        <div 
          className='volume-slider__thumb'
          style={{ left: `${volume * 100}%` }}
        />
        <div 
          className='volume-slider__click-capture'
          onClick={calculateVolume}
        />
      </div>
    </div>
  );
}

export default VolumeSlider;