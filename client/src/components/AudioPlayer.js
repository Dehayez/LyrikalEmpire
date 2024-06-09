import React, { useState, useEffect, useRef } from 'react';

let currentPlaying;

const AudioPlayer = ({ currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef();

  useEffect(() => {
    if (currentTrack && currentTrack.audio) {
      if (currentPlaying && currentPlaying !== audioRef.current) {
        currentPlaying.pause();
      }
      audioRef.current.src = `/${currentTrack.audio}`;
      setIsPlaying(true);
      currentPlaying = audioRef.current;
    } else {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.src = '';
        setProgress(0);
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime / audioRef.current.duration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 0, width: '100%', background: '#eee' }}>
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <div>
        Progress: {Math.round(progress * 100)}%
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

export default AudioPlayer;