import React, { useState, useEffect, useRef } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.css';

let currentPlaying;

const AudioPlayer = ({ currentTrack, paused }) => { // Add paused prop
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const playerRef = useRef();

  useEffect(() => {
    if (currentTrack && currentTrack.audio) {
      if (currentPlaying && currentPlaying !== playerRef.current && currentPlaying.audio && currentPlaying.audio.current) {
        currentPlaying.audio.current.pause();
      }
      setIsPlaying(true);
      currentPlaying = playerRef.current;
      if (paused) {
        playerRef.current.audio.current.pause();
      } else {
        playerRef.current.audio.current.play();
      }
    } else {
      setIsPlaying(false);
      if (playerRef.current && playerRef.current.audio && playerRef.current.audio.current) {
        playerRef.current.audio.current.currentTime = 0;
      }
    }
  }, [currentTrack, paused]);

  const handleListen = () => {
    if (playerRef.current) {
      const progress = playerRef.current.audio.current.currentTime / playerRef.current.audio.current.duration;
      setIsPlaying(!playerRef.current.audio.current.paused);
      if (!isNaN(progress)) {
        setProgress(progress);
      }
    }
  };

  return (
    <div className="audio-player-wrapper">
    <H5AudioPlayer
      autoPlayAfterSrcChange={true}
      src={currentTrack ? currentTrack.audio : ''}
      ref={playerRef}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onListen={handleListen}
      customProgressBarSection={[
          RHAP_UI.CURRENT_TIME,
          RHAP_UI.PROGRESS_BAR,
          RHAP_UI.DURATION
      ]}
      customControlsSection={[
          RHAP_UI.MAIN_CONTROLS
      ]}
    />
  </div>
  );
};

export default AudioPlayer;