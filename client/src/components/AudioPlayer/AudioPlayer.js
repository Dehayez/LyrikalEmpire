import React from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';

import { isMobileOrTablet } from '../../utils';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

import { NextButton, PlayPauseButton, PrevButton, VolumeSlider, ShuffleButton, RepeatButton } from './AudioControls';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.scss';

const AudioPlayer = ({ currentBeat, setCurrentBeat, isPlaying, setIsPlaying, onNext, onPrev, shuffle, setShuffle, repeat, setRepeat }) => {
  const {
    playerRef,
    volume,
    handleVolumeChange,
    isDragging,
    dragPosition,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handlePrevClick,
  } = useAudioPlayer({ currentBeat, setCurrentBeat, isPlaying, setIsPlaying, onNext, onPrev, shuffle, setShuffle, repeat, setRepeat });

  const audioSrc = currentBeat ? `/uploads/${currentBeat.audio}` : '';

  return isMobileOrTablet() ? (
    <div className="audio-player audio-player--mobile" id="audio-player">
      <H5AudioPlayer
          className="smooth-progress-bar smooth-progress-bar--mobile"
          autoPlayAfterSrcChange={true}
          src={audioSrc}
          ref={playerRef}
          customProgressBarSection={[
              RHAP_UI.CURRENT_TIME,
              RHAP_UI.PROGRESS_BAR,
              RHAP_UI.DURATION
          ]}
        />
      {currentBeat && (
       <p className="audio-player__title" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={handleTouchMove} style={{ transform: `translateX(${dragPosition}px)` }}>
          {currentBeat.title}
        </p>
      )}
      <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} className="small" />
    </div>
  ) : (
    <div className="audio-player" id="audio-player">
      <div className='audio-player__title audio-player__title--desktop' style={{ flex: '1' }}>
        {currentBeat && <p>{currentBeat.title}</p>}
      </div>
      <div style={{ flex: '2' }}>
        <H5AudioPlayer
          className="smooth-progress-bar"
          autoPlayAfterSrcChange={true}
          src={audioSrc}
          ref={playerRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          customProgressBarSection={[
              RHAP_UI.CURRENT_TIME,
              RHAP_UI.PROGRESS_BAR,
              RHAP_UI.DURATION
          ]}
          customControlsSection={[
            <ShuffleButton shuffle={shuffle} setShuffle={setShuffle} />,
            <PrevButton onPrev={handlePrevClick} />,
            <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />,
            <NextButton onNext={onNext} />,
            <RepeatButton repeat={repeat} setRepeat={setRepeat} />,
          ]}
        />
      </div>
      <VolumeSlider volume={volume} handleVolumeChange={handleVolumeChange} />
    </div>
  );
};

export default AudioPlayer;