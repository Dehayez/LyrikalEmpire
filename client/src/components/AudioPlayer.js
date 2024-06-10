import React, { useEffect, useRef, useState } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.css';
import { IoPlaySkipBackSharp, IoPlaySkipForwardSharp, IoPlaySharp, IoPauseSharp } from "react-icons/io5";

let currentPlaying;

const AudioPlayer = ({ currentTrack, isPlaying, setIsPlaying, onNext, onPrev }) => {
  const playerRef = useRef();
  const [animatePlayPause, setAnimatePlayPause] = useState(false);

  useEffect(() => {
    if (currentTrack && currentTrack.audio) {
      if (currentPlaying && currentPlaying !== playerRef.current && currentPlaying.audio && currentPlaying.audio.current) {
        currentPlaying.audio.current.pause();
      }
      currentPlaying = playerRef.current;
      if (isPlaying) {
        playerRef.current.audio.current.play();
      } else {
        playerRef.current.audio.current.pause();
      }
    } else {
      if (playerRef.current && playerRef.current.audio && playerRef.current.audio.current) {
        playerRef.current.audio.current.currentTime = 0;
      }
    }
  }, [currentTrack, isPlaying]);

  const handleListen = () => {
    if (playerRef.current) {
      setIsPlaying(!playerRef.current.audio.current.paused);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setAnimatePlayPause(true);
    setTimeout(() => setAnimatePlayPause(false), 200);
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
        <button className="icon-button" onClick={onPrev}><IoPlaySkipBackSharp size={24} /></button>,
        <button className={`icon-button play-pause ${animatePlayPause ? 'animate-scale' : ''}`} onClick={handlePlayPause}>
          {isPlaying ? <IoPauseSharp size={24} /> : <IoPlaySharp size={24} />}
        </button>,
        <button className="icon-button" onClick={onNext}><IoPlaySkipForwardSharp size={24} /></button>
      ]}
      />
    </div>
  );
};

export default AudioPlayer;