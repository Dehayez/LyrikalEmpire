import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { FiPlayCircle, FiPauseCircle } from 'react-icons/fi';

let currentPlaying;

const AudioPlayer = ({ currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const playerRef = useRef();

  useEffect(() => {
    if (currentTrack && currentTrack.audio) {
      if (currentPlaying && currentPlaying !== playerRef.current) {
        currentPlaying.getInternalPlayer().pause();
      }
      setIsPlaying(true);
      currentPlaying = playerRef.current;
    } else {
      setIsPlaying(false);
      if (playerRef.current) {
        setProgress(0);
      }
    }
  }, [currentTrack]);

  const handleProgress = state => {
    setProgress(state.played);
  };

  const handleSeekChange = e => {
    setProgress(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = e => {
    setIsPlaying(false);
  };

  const handleSeekMouseUp = e => {
    setIsPlaying(true);
    playerRef.current.seekTo(parseFloat(e.target.value));
  };

  return (
    <div style={{ position: 'fixed', bottom: 0, width: '100%', background: '#282828', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '20px' }}>
      <input type='range' min={0} max={0.999999} step='any' value={progress} onMouseDown={handleSeekMouseDown} onChange={handleSeekChange} onMouseUp={handleSeekMouseUp} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ width: '100%', position: 'absolute', top: 0, background: isHovering ? '#fff' : '#000' }} />
      {isPlaying ? (
        <FiPauseCircle size={48} onClick={() => setIsPlaying(!isPlaying)} />
      ) : (
        <FiPlayCircle size={48} onClick={() => setIsPlaying(!isPlaying)} />
      )}
      <ReactPlayer ref={playerRef} url={currentTrack && `/${currentTrack.audio}`} playing={isPlaying} onProgress={handleProgress} hidden />
    </div>
  );
};

export default AudioPlayer;