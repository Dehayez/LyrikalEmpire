import React, { useEffect, useRef } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.scss';
import { NextButton, PlayPauseButton, PrevButton } from '../AudioControls';

let currentPlaying;

const AudioPlayer = ({ currentBeat, isPlaying, setIsPlaying, onNext, onPrev }) => {
  const playerRef = useRef();

  const handlePlayPause = (play) => {
    if (playerRef.current && playerRef.current.audio && playerRef.current.audio.current) {
      play ? playerRef.current.audio.current.play() : playerRef.current.audio.current.pause();
    }
  }

  useEffect(() => {
    if (currentBeat && currentBeat.audio) {
      if (currentPlaying && currentPlaying !== playerRef.current) {
        handlePlayPause(false);
      }
      currentPlaying = playerRef.current;
      handlePlayPause(isPlaying);
    } else {
      if (playerRef.current && playerRef.current.audio && playerRef.current.audio.current) {
        playerRef.current.audio.current.currentTime = 0;
      }
    }
  }, [currentBeat, isPlaying]);

  return (
    <div className="audio-player-wrapper">
      <H5AudioPlayer
        autoPlayAfterSrcChange={true}
        src={currentBeat ? currentBeat.audio : ''}
        ref={playerRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        customProgressBarSection={[
            RHAP_UI.CURRENT_TIME,
            RHAP_UI.PROGRESS_BAR,
            RHAP_UI.DURATION
        ]}
        customControlsSection={[
          <PrevButton onPrev={onPrev} />,
          <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />,
          <NextButton onNext={onNext} />
        ]}
      />
    </div>
  );
};

export default AudioPlayer;