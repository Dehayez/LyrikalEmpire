import React from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import { PiWaveform } from "react-icons/pi";
import { LiaMicrophoneAltSolid } from "react-icons/lia";

import { IconButton } from '../Buttons';
import { NextButton, PlayPauseButton, PrevButton, VolumeSlider, ShuffleButton, RepeatButton } from './AudioControls';

import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.scss';

const DesktopAudioPlayer = ({
  playerRef,
  audioSrc,
  currentBeat,
  isPlaying,
  handlePlayPause,
  handlePrevClick,
  onNext,
  preventDefaultAudioEvents,
  artistName,
  shuffle,
  setShuffle,
  repeat,
  setRepeat,
  toggleWaveform,
  toggleLyricsModal,
  volume,
  handleVolumeChange,
  waveform,
  waveformRef,
  syncAllPlayers,
  lyricsModal
}) => {
  return (
    <div className="audio-player audio-player--desktop audio">
      <div className='audio-player__text audio-player__text--desktop' style={{ flex: '1' }}>
        <p className="audio-player__title">{currentBeat.title}</p>
        <p className="audio-player__artist">{artistName}</p>
      </div>
      <div style={{ flex: '3' }}>
        <H5AudioPlayer
          ref={playerRef}
          className="smooth-progress-bar smooth-progress-bar--desktop"
          autoPlayAfterSrcChange={false}
          src={audioSrc}
          {...preventDefaultAudioEvents}
          customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
          onLoadedMetadata={() => {
            requestAnimationFrame(() => syncAllPlayers(true));
          }}
          customControlsSection={[
            <>
              <ShuffleButton shuffle={shuffle} setShuffle={setShuffle} />
              <PrevButton onPrev={handlePrevClick} />
              <PlayPauseButton isPlaying={isPlaying} setIsPlaying={handlePlayPause} />
              <NextButton onNext={onNext} />
              <RepeatButton repeat={repeat} setRepeat={setRepeat} />
            </>
          ]}
        />
        <div
          ref={waveformRef}
          className={`waveform ${waveform ? 'waveform--active' : ''}`}
        ></div>
      </div>
      <div className='audio-player__settings' style={{ flex: '1' }}>
        <IconButton
          onClick={toggleWaveform}
          text={waveform ? 'Hide waveform' : 'Show waveform'}
          ariaLabel={waveform ? 'Hide waveform' : 'Show waveform'}
        >
          <PiWaveform className={waveform ? 'icon-primary' : ''} />
        </IconButton>
        <IconButton
          onClick={toggleLyricsModal}
          text={lyricsModal ? 'Hide lyrics' : 'Show lyrics'}
          ariaLabel={lyricsModal ? 'Hide lyrics' : 'Show lyrics'}
        >
          <LiaMicrophoneAltSolid className={lyricsModal ? 'icon-primary' : ''} />
        </IconButton>
        <VolumeSlider volume={volume} handleVolumeChange={handleVolumeChange} />
      </div>
    </div>
  );
};

export default DesktopAudioPlayer; 