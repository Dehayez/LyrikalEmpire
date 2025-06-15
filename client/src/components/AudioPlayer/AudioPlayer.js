import React, { useEffect, useRef, useState } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import WaveSurfer from 'wavesurfer.js';
import { LiaMicrophoneAltSolid } from "react-icons/lia";
import { PiWaveform } from "react-icons/pi";
import { IoChevronDownSharp, IoEllipsisHorizontalSharp, IoAddSharp, IoListSharp, IoRemoveCircleOutline } from "react-icons/io5";
import { Queue02 } from "../../assets/icons";

import { isMobileOrTablet, slideIn, slideOut } from '../../utils';
import { useAudioPlayer, useLocalStorageSync, useDragToDismiss } from '../../hooks';
import { getSignedUrl, getUserById } from '../../services';
import { usePlaylist } from '../../contexts';

import { ContextMenu } from '../ContextMenu';
import { NextButton, PlayPauseButton, PrevButton, VolumeSlider, ShuffleButton, RepeatButton } from './AudioControls';
import { IconButton } from '../Buttons';

import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.scss';

const AudioPlayer = ({
  currentBeat, setCurrentBeat,
  isPlaying, setIsPlaying,
  onNext, onPrev,
  shuffle, setShuffle,
  repeat, setRepeat,
  lyricsModal, setLyricsModal
}) => {

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
  } = useAudioPlayer({
    currentBeat, setCurrentBeat,
    isPlaying, setIsPlaying,
    onNext, onPrev,
    shuffle, setShuffle,
    repeat, setRepeat
  });

  const { playedPlaylistTitle, playlists } = usePlaylist();

  const {
    dismissRef: fullPagePlayerRef,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useDragToDismiss(() => {
    slideOut(fullPagePlayerRef.current, fullPageOverlayRef.current, () => {
      setIsFullPage(false);
      setIsFullPageVisible(false);
    });
  });

  const waveformRefDesktop = useRef(null);
  const waveformRefFullPage = useRef(null);
  const fullPageOverlayRef = useRef(null);
  const wavesurfer = useRef(null);
  const artistCache = useRef(new Map());
  
  // Single shared audio element
  const sharedAudioRef = useRef(null);
  
  const [activeContextMenu, setActiveContextMenu] = useState(false);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [audioSrc, setAudioSrc] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);
  const [waveform, setWaveform] = useState(() => JSON.parse(localStorage.getItem('waveform')) || false);
  const [isFullPage, setIsFullPage] = useState(() => {
    return JSON.parse(localStorage.getItem('isFullPage')) || false;
  });
  const [isFullPageVisible, setIsFullPageVisible] = useState(false);

  useLocalStorageSync({ waveform, isFullPage });

  const toggleLyricsModal = () => setLyricsModal(prev => !prev);
  const toggleWaveform = () => setWaveform(prev => !prev);
  
  const toggleFullPagePlayer = () => {
    if (!isFullPage) {
      setIsFullPage(true);

      requestAnimationFrame(() => {
        setIsFullPageVisible(true);
        if (fullPagePlayerRef.current) {
          slideIn(fullPagePlayerRef.current);
        }
      });
    } else {
      slideOut(fullPagePlayerRef.current, fullPageOverlayRef.current, () => {
        setIsFullPage(false);
        setIsFullPageVisible(false);
      });
    }
  };

  const handleEllipsisClick = (e) => {
    e.stopPropagation();
    const buttonRect = e.currentTarget.getBoundingClientRect();
    setContextMenuX(buttonRect.left);
    setContextMenuY(buttonRect.bottom);
    setActiveContextMenu(true);
  };

  const handleCloseContextMenu = () => {
    setActiveContextMenu(false);
  };

  // Create shared audio element once
  useEffect(() => {
    if (!sharedAudioRef.current) {
      sharedAudioRef.current = new Audio();
      sharedAudioRef.current.preload = 'metadata';
      
      // Set up event listeners for the shared audio
      const audio = sharedAudioRef.current;
      
      const updateProgress = () => {
        if (audio.duration) {
          setProgress(audio.currentTime / audio.duration);
          setDuration(audio.duration);
          
          // Update waveform progress
          if (wavesurfer.current) {
            wavesurfer.current.seekTo(audio.currentTime / audio.duration);
          }
        }
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration || 0);
      };

      const handlePlay = () => {
        setIsPlaying(true);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      };

      const handlePause = () => {
        setIsPlaying(false);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      };

      const handleEnded = () => {
        onNext();
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [onNext, setIsPlaying]);

  // Handle play/pause
  const handlePlayPause = (play) => {
    if (!sharedAudioRef.current) return;
    
    if (play) {
      sharedAudioRef.current.play().catch(console.error);
    } else {
      sharedAudioRef.current.pause();
    }
  };

  // Handle seeking
  const handleSeek = (time) => {
    if (sharedAudioRef.current) {
      sharedAudioRef.current.currentTime = time;
    }
  };

  // Effect to handle initial slide-in when full page becomes active
  useEffect(() => {
    if (isFullPage && fullPagePlayerRef.current && !isFullPageVisible) {
      setIsFullPageVisible(true);
      slideIn(fullPagePlayerRef.current);
    }
  }, [isFullPage, isFullPageVisible]);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (currentBeat?.audio) {
        try {
          const signedUrl = await getSignedUrl(currentBeat.user_id, currentBeat.audio);
          setAudioSrc(signedUrl);
          
          // Update shared audio source
          if (sharedAudioRef.current) {
            const wasPlaying = !sharedAudioRef.current.paused;
            sharedAudioRef.current.src = signedUrl;
            
            if (autoPlay || wasPlaying) {
              sharedAudioRef.current.load();
              sharedAudioRef.current.play().catch(console.error);
            }
          }
        } catch (error) {
          console.error('Error fetching signed URL:', error);
        }
      }
    };
    fetchSignedUrl();
  }, [currentBeat, autoPlay]);

  useEffect(() => {
    const setMediaSessionMetadata = async () => {
      if ('mediaSession' in navigator && currentBeat) {
        let artistName = 'Unknown Artist';

        if (currentBeat.user_id) {
          if (artistCache.current.has(currentBeat.user_id)) {
            artistName = artistCache.current.get(currentBeat.user_id);
          } else {
            try {
              const user = await getUserById(currentBeat.user_id);
              artistName = user?.username || artistName;
              artistCache.current.set(currentBeat.user_id, artistName);
            } catch (error) {
              console.warn('Could not fetch artist name. Using fallback.', error);
            }
          }
        }

        const safeArtworkUrl = currentBeat.artworkUrl?.startsWith('https')
          ? currentBeat.artworkUrl
          : 'https://www.lyrikalempire.com/placeholder.png';

        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: currentBeat.title || 'Unknown Title',
          artist: artistName,
          album: currentBeat.album || '',
          artwork: [{ src: safeArtworkUrl, sizes: '512x512', type: 'image/png' }]
        });
      }
    };

    setMediaSessionMetadata();
  }, [currentBeat]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => handlePlayPause(true));
      navigator.mediaSession.setActionHandler('pause', () => handlePlayPause(false));
      navigator.mediaSession.setActionHandler('previoustrack', handlePrevClick);
      navigator.mediaSession.setActionHandler('nexttrack', onNext);
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [handlePrevClick, onNext]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const loadWaveform = async () => {
      const container = isFullPage ? waveformRefFullPage.current : waveformRefDesktop.current;

      if (container && audioSrc && waveform) {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
        }

        wavesurfer.current = WaveSurfer.create({
          container,
          waveColor: '#828282',
          progressColor: '#FFCC44',
          height: 80,
          responsive: true,
          interact: false,
          cursorColor: '#FFCC44',
          cursorWidth: 0,
          partialRender: true,
          barWidth: 1,
          barGap: 2,
          barRadius: 0,
        });

        try {
          const response = await fetch(audioSrc, { signal });
          if (!response.ok) throw new Error('Network response was not ok');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          wavesurfer.current.load(url);
          wavesurfer.current.setVolume(0);
          
          wavesurfer.current.on('ready', () => {
            const duration = wavesurfer.current.getDuration();
            if (sharedAudioRef.current && !isNaN(sharedAudioRef.current.currentTime) && duration > 0) {
              wavesurfer.current.seekTo(sharedAudioRef.current.currentTime / duration);
            }
          });
        } catch (error) {
          if (error.name !== 'AbortError') console.error("Error loading audio source:", error);
        }
      }
    };

    if (waveform) {
      const timer = setTimeout(loadWaveform, 100);
      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    } else {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    }

    return () => {
      controller.abort();
    };
  }, [audioSrc, isFullPage, waveform]);

  useEffect(() => {
    if (!waveform) return;

    let containerSelector;
    if (isFullPage) {
      containerSelector = '.progress-display--full-page';
    } else if (isMobileOrTablet()) {      
      containerSelector = '.progress-display--mobile';
    } else {
      containerSelector = '.progress-display--desktop';
    }

    const timer = setTimeout(() => {
      const container = document.querySelector(containerSelector);
      const waveformEl = isFullPage ? waveformRefFullPage.current : waveformRefDesktop.current;

      if (container && waveformEl && !container.contains(waveformEl)) {
        if (waveformEl.parentElement && waveformEl.parentElement !== container) {
          waveformEl.parentElement.removeChild(waveformEl);
        }

        container.style.position = 'relative';
        waveformEl.style.position = 'absolute';
        waveformEl.style.top = '0';
        waveformEl.style.left = '0';
        waveformEl.style.width = '100%';
        waveformEl.style.height = '100%';
        waveformEl.style.zIndex = '0';
        waveformEl.style.pointerEvents = 'none';

        container.appendChild(waveformEl);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [waveform, isFullPage, isFullPageVisible]);

  // Custom progress bar component
  const ProgressBar = ({ className, showControls = false }) => {
    const progressBarRef = useRef(null);

    const handleProgressClick = (e) => {
      if (!progressBarRef.current || !sharedAudioRef.current) return;
      
      const rect = progressBarRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * sharedAudioRef.current.duration;
      handleSeek(newTime);
    };

    const formatTime = (time) => {
      if (!time || isNaN(time)) return '0:00';
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <div className={`progress-container ${className}`}>
        <div className="time-display">
          <span className="current-time">{formatTime(sharedAudioRef.current?.currentTime || 0)}</span>
        </div>
        
        <div 
          className="progress-display"
          ref={progressBarRef}
          onClick={handleProgressClick}
        >
          <div className="progress-track">
            <div 
              className="progress-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        
        <div className="time-display">
          <span className="duration">{formatTime(duration)}</span>
        </div>
        
        {showControls && (
          <div className="audio-controls">
            <ShuffleButton shuffle={shuffle} setShuffle={setShuffle} />
            <PrevButton onPrev={handlePrevClick} />
            <PlayPauseButton isPlaying={isPlaying} setIsPlaying={handlePlayPause} />
            <NextButton onNext={onNext} />
            <RepeatButton repeat={repeat} setRepeat={setRepeat} />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isFullPage && (
        <>
          <div
            ref={fullPageOverlayRef}
            className={`audio-player__full-page-overlay ${isFullPageVisible ? 'visible' : ''}`}
          />
          <div
            ref={fullPagePlayerRef}
            className="audio-player audio-player__full-page"
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div className="audio-player__full-page-header">
              <IconButton
                className="audio-player__close-button"
                onClick={toggleFullPagePlayer}
                text="Close"
                ariaLabel="Close full-page player"
              >
                <IoChevronDownSharp />
              </IconButton>
              <p className="audio-player__full-page-title">
                {playedPlaylistTitle || 'All Tracks'}
              </p>
              <IconButton
                className="audio-player__ellipsis-button"
                onClick={handleEllipsisClick}
              >
                <IoEllipsisHorizontalSharp />
              </IconButton>
            </div>
            <div className="audio-player__full-page-content">
              <div className="audio-player__full-page-info">
                <p className="audio-player__title">
                  {currentBeat?.title || 'Audio Player'}
                </p>
                <p className="audio-player__artist">
                  {artistCache.current.get(currentBeat?.user_id) || 'Unknown Artist'}
                </p>
              </div>
              
              <ProgressBar className="progress-container--full-page" showControls />
              
              <div className="audio-player__additional-controls">
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
              </div>
              
              <div ref={waveformRefFullPage} className={`waveform ${waveform ? 'waveform--active' : ''}`}></div>
            </div>
          </div>
        </>
      )}

      {!isFullPage && (
        isMobileOrTablet() ? (
          <div className="audio-player audio-player--mobile" onClick={toggleFullPagePlayer}>
            <ProgressBar className="progress-container--mobile" />
            
            {currentBeat && (
              <p 
                className="audio-player__title" 
                onTouchStart={handleTouchStart} 
                onTouchEnd={handleTouchEnd} 
                onTouchMove={handleTouchMove} 
                style={{ transform: `translateX(${dragPosition}px)` }}
              >
                {currentBeat.title}
              </p>
            )}
            <PlayPauseButton isPlaying={isPlaying} setIsPlaying={handlePlayPause} className="small" />
          </div>
        ) : (
          <div className="audio-player">
            <div className='audio-player__title audio-player__title--desktop' style={{ flex: '1' }}>
              {currentBeat && <p>{currentBeat.title}</p>}
            </div>
            <div style={{ flex: '3' }}>
              <ProgressBar className="progress-container--desktop" showControls />
              <div
                ref={waveformRefDesktop}
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
        )
      )}

      {activeContextMenu && (
        <ContextMenu
          beat={currentBeat}
          position={{ top: contextMenuY, left: contextMenuX }}
          setActiveContextMenu={handleCloseContextMenu}
          items={[
            {
              icon: IoAddSharp,
              text: 'Add to playlist',
              subItems: playlists.map((playlist) => ({
                text: playlist.title,
                onClick: () => console.log(`Add to playlist: ${playlist.title}`)
              }))
            },
            {
              icon: Queue02,
              text: 'Add to queue',
              onClick: () => console.log('Add to queue')
            },
            {
              icon: IoRemoveCircleOutline,
              text: 'Remove from queue',
              onClick: () => console.log('Remove from queue')
            }
          ]}
        />
      )}
    </>
  );
};

export default AudioPlayer;