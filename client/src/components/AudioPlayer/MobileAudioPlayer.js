import React from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import { PlayPauseButton } from './AudioControls';

import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.scss';

const MobileAudioPlayer = ({
  playerRef,
  audioSrc,
  currentBeat,
  isPlaying,
  handlePlayPause,
  preventDefaultAudioEvents,
  artistName,
  toggleFullPagePlayer,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  dragPosition,
  lyricsModal,
  syncAllPlayers
}) => {
  return (
    <div
      className={`audio-player audio-player--mobile ${lyricsModal ? 'audio-player--lyrics-modal-open' : ''}`}
      onClick={toggleFullPagePlayer}
    >
      <H5AudioPlayer
        ref={playerRef}
        className="smooth-progress-bar smooth-progress-bar--mobile"
        autoPlayAfterSrcChange={false}
        src={audioSrc}
        {...preventDefaultAudioEvents}
        customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
        customControlsSection={[]}
      />
      
      <div className="audio-player__text" 
           onTouchStart={handleTouchStart} 
           onTouchEnd={handleTouchEnd} 
           onTouchMove={handleTouchMove} 
           style={{ transform: `translateX(${dragPosition}px)` }}>
        <p className="audio-player__title">{currentBeat.title}</p>
        <p className="audio-player__artist">{artistName}</p>
      </div>
      <PlayPauseButton isPlaying={isPlaying} setIsPlaying={handlePlayPause} className="small" />
    </div>
  );
};

export default MobileAudioPlayer; 