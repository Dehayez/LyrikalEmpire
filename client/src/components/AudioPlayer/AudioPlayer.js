import React, { useEffect, useRef, useState } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import WaveSurfer from 'wavesurfer.js';
import { LiaMicrophoneAltSolid } from "react-icons/lia";
import { PiSelectionDuotone, PiWaveform } from "react-icons/pi";

import { isMobileOrTablet } from '../../utils';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { getSignedUrl } from '../../services/beatService';

import { NextButton, PlayPauseButton, PrevButton, VolumeSlider, ShuffleButton, RepeatButton } from './AudioControls';
import { IconButton } from '../Buttons';
import { Tooltip } from '../Tooltip';

import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.scss';

const AudioPlayer = ({ currentBeat, setCurrentBeat, isPlaying, setIsPlaying, onNext, onPrev, shuffle, setShuffle, repeat, setRepeat, lyricsModal, setLyricsModal }) => {
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
    currentTime,
  } = useAudioPlayer({ currentBeat, setCurrentBeat, isPlaying, setIsPlaying, onNext, onPrev, shuffle, setShuffle, repeat, setRepeat });
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [audioSrc, setAudioSrc] = useState('');
  const [waveform, setWaveform] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false);


  const toggleLyricsModal = () => {
    setLyricsModal(prevState => !prevState);
  };

  const toggleWaveform = () => {
    setWaveform(prevState => !prevState);
  };

  // Local Audiofiles
/*   useEffect(() => {
    if (currentBeat && currentBeat.audio) {
      const localAudioSrc = `/uploads/${currentBeat.audio}`;
      setAudioSrc(localAudioSrc);
    }
  }, [currentBeat]); */ 

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (currentBeat && currentBeat.audio) {
        try {
          const signedUrl = await getSignedUrl(currentBeat.user_id, currentBeat.audio);
          setAudioSrc(signedUrl);
        } catch (error) {
          console.error('Error fetching signed URL:', error);
        }
      }
    };
  
    fetchSignedUrl();
  }, [currentBeat]);

  useEffect(() => {
    if (audioSrc) {
      const timer = setTimeout(() => {
        setAutoPlay(true);
      }, 1000);
  
      return () => clearTimeout(timer);
    }
  }, [audioSrc]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
  
    const timer = setTimeout(() => {
      if (waveformRef.current && audioSrc) {
        while (waveformRef.current.firstChild) {
          waveformRef.current.removeChild(waveformRef.current.firstChild);
        }
  
        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: '#828282',
          progressColor: '#FFCC44',
          height: 80,
          barWidth: 2,
          responsive: true,
          interact: false,
          cursorColor: '#FFCC44', 
          cursorWidth: 0,
        });

        fetch(audioSrc, { signal })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.blob();
          })
          .then(blob => {
            const url = URL.createObjectURL(blob);
            wavesurfer.current.load(url);
            wavesurfer.current.setVolume(0);
  
            wavesurfer.current.on('ready', () => {
              const duration = wavesurfer.current.getDuration();
              if (!isNaN(currentTime) && duration > 0) {
                wavesurfer.current.seekTo(currentTime / duration);
              }
            });
          })
          .catch(error => {
            if (error.name === 'AbortError') {
              console.log('Fetch aborted');
            } else {
              console.error("Error loading audio source:", error);
            }
          });
      }
    }, 100);
  
    return () => {
      clearTimeout(timer);
      if (wavesurfer.current) {
        try {
          if (wavesurfer.current.isReady) {
            wavesurfer.current.destroy();
          } else {
            wavesurfer.current.once('ready', () => {
              wavesurfer.current.destroy();
            });
          }
        } catch (error) {
          console.error("Error destroying wavesurfer instance:", error);
        }
      }
    };
  }, [audioSrc]);

  useEffect(() => {
    const progressContainer = document.querySelector('.rhap_progress-container');
    if (progressContainer && waveformRef.current && !progressContainer.contains(waveformRef.current)) {
      progressContainer.appendChild(waveformRef.current);
    }
  }, []);

/*   useEffect(() => {
    if (wavesurfer.current) {
      if (isPlaying) {
        wavesurfer.current.play();
      } else {
        wavesurfer.current.pause();
      }
    }
  }, [isPlaying]); */

  useEffect(() => {
    if (wavesurfer.current) {
      const duration = wavesurfer.current.getDuration();
      if (!isNaN(currentTime) && duration > 0) {
        wavesurfer.current.seekTo(currentTime / duration);
      }
    }
  }, [currentTime]);

  return isMobileOrTablet() ? (
    <div className="audio-player audio-player--mobile" id="audio-player">
      <H5AudioPlayer
          className="smooth-progress-bar smooth-progress-bar--mobile"
          autoPlayAfterSrcChange={autoPlay}
          src={audioSrc}
          ref={playerRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
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
      <div style={{ flex: '3' }}>
        <H5AudioPlayer
          className="smooth-progress-bar smooth-progress-bar--desktop"
          autoPlayAfterSrcChange={autoPlay}
          src={audioSrc}
          ref={playerRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
          customControlsSection={[
            <ShuffleButton shuffle={shuffle} setShuffle={setShuffle} />,
            <PrevButton onPrev={handlePrevClick} />,
            <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />,
            <NextButton onNext={onNext} />,
            <RepeatButton repeat={repeat} setRepeat={setRepeat} />,
          ]}
        />
        <div ref={waveformRef} className={`waveform ${waveform? 'waveform--active' : ''}`}></div>
      </div>
      <div className='audio-player__settings' style={{ flex: '1' }}>
        <IconButton className='audio-player__icon' onClick={toggleWaveform}>
          <PiWaveform fontSize={24} className={waveform ? 'icon-primary' : ''} />
          {!isMobileOrTablet() && <Tooltip text={waveform ? "Hide waveform" : "Show waveform"} />}
        </IconButton>
        <IconButton className='audio-player__icon' onClick={toggleLyricsModal}>
          <LiaMicrophoneAltSolid fontSize={24} className={lyricsModal ? 'icon-primary' : ''} />
          {!isMobileOrTablet() && <Tooltip text={lyricsModal ? "Hide lyrics" : "Show lyrics"} />}
        </IconButton>
        <VolumeSlider volume={volume} handleVolumeChange={handleVolumeChange} />
      </div>
    </div>
  );
};

export default AudioPlayer;