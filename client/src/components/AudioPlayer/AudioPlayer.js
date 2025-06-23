import React, { useEffect, useRef, useState } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import WaveSurfer from 'wavesurfer.js';
import { LiaMicrophoneAltSolid } from "react-icons/lia";
import { PiWaveform } from "react-icons/pi";
import { IoChevronDownSharp, IoEllipsisHorizontalSharp, IoAddSharp, IoListSharp, IoRemoveCircleOutline, IoOptionsSharp } from "react-icons/io5";
import { LuDisc3 } from "react-icons/lu";
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

  // Guard clause: Don't render if there's no current beat
  if (!currentBeat) {
    return null;
  }

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
  
  // Refs for display-only H5AudioPlayer instances
  const mobilePlayerRef = useRef(null);
  const desktopPlayerRef = useRef(null);
  const fullPageProgressRef = useRef(null);
  
  const [artistName, setArtistName] = useState('Unknown Artist');
  const [activeContextMenu, setActiveContextMenu] = useState(false);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTimeState, setCurrentTimeState] = useState(0);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isReturningFromLyrics, setIsReturningFromLyrics] = useState(false);
  const [isOptionsActive, setIsOptionsActive] = useState(true);

  const [audioSrc, setAudioSrc] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);
  const [waveform, setWaveform] = useState(() => JSON.parse(localStorage.getItem('waveform')) || false);
  const [isFullPage, setIsFullPage] = useState(() => {
    return JSON.parse(localStorage.getItem('isFullPage')) || false;
  });
  const [isFullPageVisible, setIsFullPageVisible] = useState(false);

  // Determine which player to show based on isFullPage AND lyricsModal state
  const shouldShowFullPagePlayer = isFullPage && !(isMobileOrTablet() && lyricsModal);
  const shouldShowMobilePlayer = !shouldShowFullPagePlayer && isMobileOrTablet();

  useLocalStorageSync({ waveform, isFullPage });

  const toggleLyricsModal = () => setLyricsModal(prev => !prev);
  const toggleWaveform = () => setWaveform(prev => !prev);
  
  const toggleFullPagePlayer = () => {
    // Don't allow opening full page player when lyrics modal is open on mobile
    if (isMobileOrTablet() && lyricsModal) {
      return;
    }

    if (!isFullPage) {
      setIsFullPage(true);
      setIsReturningFromLyrics(false); // Reset flag when manually opening

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
        setIsReturningFromLyrics(false); // Reset flag when closing
      });
    }
  };

  const toggleOptions = () => {
    setIsOptionsActive((prev) => !prev);
  };

  // Close full page player when lyrics modal opens on mobile
  useEffect(() => {
    if (isMobileOrTablet() && lyricsModal && isFullPage) {
      // Mark that we're going to return from lyrics modal
      setIsReturningFromLyrics(true);
      // Smoothly close the full page player
      slideOut(fullPagePlayerRef.current, fullPageOverlayRef.current, () => {
        setIsFullPageVisible(false);
      });
    } else if (isMobileOrTablet() && !lyricsModal && isFullPage && !isFullPageVisible) {
      // Re-open full page player when lyrics modal closes (if it was open before)
      requestAnimationFrame(() => {
        setIsFullPageVisible(true);
        if (fullPagePlayerRef.current) {
          // Only slide in if we're not returning from lyrics modal
          if (!isReturningFromLyrics) {
            slideIn(fullPagePlayerRef.current);
          } else {
            // Just show without animation and reset the flag
            fullPagePlayerRef.current.style.transform = 'translateY(0)';
            fullPagePlayerRef.current.style.opacity = '1';
            setIsReturningFromLyrics(false);
          }
        }
      });
    }
  }, [lyricsModal, isFullPage, isFullPageVisible, isReturningFromLyrics]);

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

  // Sync all display players with main audio element
  const syncAllPlayers = (forceUpdate = false) => {
    const mainAudio = playerRef.current?.audio.current;
    if (!mainAudio) return;

    const currentTime = mainAudio.currentTime || 0;
    const duration = mainAudio.duration || 0;
    
    // Update state
    setCurrentTimeState(currentTime);
    setDuration(duration);
    setProgress(duration ? currentTime / duration : 0);

    // Update waveform
    if (wavesurfer.current && duration) {
      wavesurfer.current.seekTo(currentTime / duration);
    }

    // Force update display players by manipulating their progress bars directly
    const updateProgressBar = (playerRef) => {
      if (playerRef?.current) {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          const progressBar = playerRef.current.container.current?.querySelector('.rhap_progress-filled');
          const progressIndicator = playerRef.current.container.current?.querySelector('.rhap_progress-indicator');
          const currentTimeEl = playerRef.current.container.current?.querySelector('.rhap_current-time');
          const durationEl = playerRef.current.container.current?.querySelector('.rhap_total-time');
          
          if (progressBar) {
            const progressPercent = duration ? (currentTime / duration) * 100 : 0;
            progressBar.style.width = `${progressPercent}%`;
            progressBar.style.transition = 'none';
            
            if (progressIndicator) {
              progressIndicator.style.left = `${progressPercent}%`;
              progressIndicator.style.transition = 'none';
            }
          }
          
          if (currentTimeEl) {
            currentTimeEl.textContent = formatTime(currentTime);
          }
          
          if (durationEl) {
            durationEl.textContent = formatTime(duration);
          }
        });
      }
    };

    // Update all display players that are currently rendered
    if (shouldShowMobilePlayer) {
      updateProgressBar(mobilePlayerRef);
    }
    if (!isMobileOrTablet()) {
      updateProgressBar(desktopPlayerRef);
    }
    if (shouldShowFullPagePlayer && isFullPageVisible) {
      updateProgressBar(fullPageProgressRef);
    }
  };

  // Format time helper function
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Set up main audio player event listeners
  useEffect(() => {
    const mainAudio = playerRef.current?.audio.current;
    if (!mainAudio) return;

    const handleTimeUpdate = () => {
      syncAllPlayers();
    };

    const handleLoadedMetadata = () => {
      // Wait a bit for the audio to be ready, then sync
      setTimeout(() => syncAllPlayers(true), 100);
    };

    const handleLoadedData = () => {
      syncAllPlayers(true);
    };

    const handleCanPlay = () => {
      syncAllPlayers(true);
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

    mainAudio.addEventListener('timeupdate', handleTimeUpdate);
    mainAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
    mainAudio.addEventListener('loadeddata', handleLoadedData);
    mainAudio.addEventListener('canplay', handleCanPlay);
    mainAudio.addEventListener('play', handlePlay);
    mainAudio.addEventListener('pause', handlePause);
    mainAudio.addEventListener('ended', handleEnded);
    
    // Initial sync - force update even when paused
    const initialSync = () => {
      if (mainAudio.readyState >= 1) {
        syncAllPlayers(true);
      }
    };
    
    initialSync();
    
    // Also try after a short delay in case metadata isn't loaded yet
    const timeoutId = setTimeout(initialSync, 200);

    return () => {
      clearTimeout(timeoutId);
      mainAudio.removeEventListener('timeupdate', handleTimeUpdate);
      mainAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      mainAudio.removeEventListener('loadeddata', handleLoadedData);
      mainAudio.removeEventListener('canplay', handleCanPlay);
      mainAudio.removeEventListener('play', handlePlay);
      mainAudio.removeEventListener('pause', handlePause);
      mainAudio.removeEventListener('ended', handleEnded);
    };
  }, [playerRef.current?.audio.current, onNext, setIsPlaying]);

  // Handle play/pause from UI
  const handlePlayPause = (play) => {
    const audio = playerRef.current?.audio.current;
    if (audio) {
      if (play) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    }
  };

  // Handle seeking from display players
  const handleSeeked = (e) => {
    const mainAudio = playerRef.current?.audio.current;
    const newTime = e.target.currentTime;
    
    if (mainAudio && Math.abs(mainAudio.currentTime - newTime) > 0.1) {
      mainAudio.currentTime = newTime;
      syncAllPlayers();
    }
  };

  // Handle manual seeking on progress bar
  const handleProgressClick = (e) => {
    const mainAudio = playerRef.current?.audio.current;
    if (!mainAudio || !mainAudio.duration) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressPercent = clickX / rect.width;
    const newTime = progressPercent * mainAudio.duration;
    
    mainAudio.currentTime = newTime;
    syncAllPlayers();
  };

  // Get current audio state for immediate rendering
  const getCurrentAudioState = () => {
    const mainAudio = playerRef.current?.audio.current;
    if (!mainAudio) return { currentTime: 0, duration: 0, progress: 0 };
    
    const currentTime = mainAudio.currentTime || 0;
    const duration = mainAudio.duration || 0;
    const progress = duration ? (currentTime / duration) * 100 : 0;
    
    return { currentTime, duration, progress };
  };

  // Override H5AudioPlayer events to prevent conflicts
  const preventDefaultAudioEvents = {
    onPlay: (e) => {
      e.preventDefault();
      handlePlayPause(true);
    },
    onPause: (e) => {
      e.preventDefault();
      handlePlayPause(false);
    },
    onLoadStart: () => {},
    onCanPlay: () => {},
    onLoadedData: () => {},
    onSeeked: handleSeeked,
  };

  // Pre-calculate progress for immediate rendering
  const audioState = getCurrentAudioState();
  const progressStyle = {
    width: `${audioState.progress}%`
  };
  const progressIndicatorStyle = {
    left: `${audioState.progress}%`
  };

  // Effect to sync display players when they're rendered or view changes
  useEffect(() => {
    const syncAfterRender = () => {
      // Immediate sync without delay for view changes
      syncAllPlayers(true);
      
      // Also force sync with requestAnimationFrame for next paint cycle
      requestAnimationFrame(() => {
        syncAllPlayers(true);
      });
    };
    
    // Immediate sync when switching views
    syncAfterRender();
    
    return () => {};
  }, [shouldShowFullPagePlayer, shouldShowMobilePlayer, isFullPageVisible]);

  // Additional effect to ensure sync after display players are mounted
  useEffect(() => {
    const ensureSync = () => {
      const mainAudio = playerRef.current?.audio.current;
      if (mainAudio && (mainAudio.readyState >= 1 || mainAudio.duration)) {
        syncAllPlayers(true);
      }
    };

    // Immediate sync, then fallback syncs
    ensureSync();
    
    // Reduced timeout intervals for faster sync
    const intervals = [0, 16, 50]; // 0ms, one frame, then 50ms
    const timeouts = intervals.map(delay => 
      setTimeout(ensureSync, delay)
    );

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [audioSrc, shouldShowFullPagePlayer]);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (currentBeat?.audio) {
        try {
          setAudioSrc('');
          const signedUrl = await getSignedUrl(currentBeat.user_id, currentBeat.audio);
          setAudioSrc(signedUrl);

          // Set autoPlay to true only after the first render
          if (!isFirstRender) {
            setAutoPlay(true);
          } else {
            setIsFirstRender(false); // Mark first render as complete
          }

          // Force sync after audio source changes
          setTimeout(() => {
            syncAllPlayers(true);
          }, 300);
        } catch (error) {
          console.error('Error fetching signed URL:', error);
        }
      }
    };
    fetchSignedUrl();
  }, [currentBeat]);

  useEffect(() => {
    const setMediaSessionMetadata = async () => {
      if ('mediaSession' in navigator && currentBeat) {
        let artistName = 'Unknown Artist';

        if (currentBeat.user_id) {
          if (artistCache.current.has(currentBeat.user_id)) {
            artistName = artistCache.current.get(currentBeat.user_id);
            setArtistName(artistName);
          } else {
            try {
              const user = await getUserById(currentBeat.user_id);
              artistName = user?.username || artistName;
              setArtistName(artistName);
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
            const mainAudio = playerRef.current?.audio.current;
            const duration = wavesurfer.current.getDuration();
            if (mainAudio && !isNaN(mainAudio.currentTime) && duration > 0) {
              wavesurfer.current.seekTo(mainAudio.currentTime / duration);
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
      containerSelector = '.smooth-progress-bar--full-page .rhap_progress-container';
    } else if (isMobileOrTablet()) {
      containerSelector = '.smooth-progress-bar--mobile .rhap_progress-container';
    } else {
      containerSelector = '.smooth-progress-bar--desktop .rhap_progress-container';
    }

    const timer = setTimeout(() => {
      const container = document.querySelector(containerSelector);
      const waveformEl = isFullPage ? waveformRefFullPage.current : waveformRefDesktop.current;

      if (container && waveformEl && !container.contains(waveformEl)) {
        if (waveformEl.parentElement && waveformEl.parentElement.classList.contains('rhap_progress-container')) {
          waveformEl.parentElement.removeChild(waveformEl);
        }

        container.style.position = 'relative';
        waveformEl.style.position = 'absolute';
        waveformEl.style.top = '-30px';
        waveformEl.style.left = '0';
        waveformEl.style.width = '100%';
        waveformEl.style.height = '100%';
        waveformEl.style.zIndex = '0';
        waveformEl.style.pointerEvents = 'none';

        container.prepend(waveformEl);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [waveform, isFullPage, isFullPageVisible]);

  return (
    <>
      {/* Main audio player */}
      <H5AudioPlayer
        ref={playerRef}
        src={audioSrc}
        autoPlayAfterSrcChange={autoPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />

      {/* Mobile full page player */}
      {shouldShowFullPagePlayer && (
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
            {/* HEADER */}
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

            {/* CONTENT */}
            <div className="audio-player__full-page-content">
              {isOptionsActive ? (
                <div className="audio-player__full-page-image">
                  {currentBeat.artworkUrl ? (
                    <img
                      src={currentBeat.artworkUrl}
                      alt={currentBeat.title || 'Audio Cover'}
                      className="audio-player__cover-image"
                    />
                  ) : (
                    <img
                      src="https://www.lyrikalempire.com/placeholder.png"
                      alt="Placeholder Cover"
                      className="audio-player__cover-image"
                    />
                  )}
                  </div>
              ) : (
                  <p className="audio-player__full-page-description">
                    {currentBeat.description || 'No description available.'}
                  </p>
              )}
            </div>

            {/* CONTROLS */}
            <div className="audio-player__full-page-controls">
              <div className="audio-player__full-page-info">
                <div className="audio-player__full-page-text">
                  <p className="audio-player__title">
                    {currentBeat.title || 'Audio Player'}
                  </p>
                  <p className="audio-player__artist">
                    {artistCache.current.get(currentBeat.user_id) || 'Unknown Artist'}
                  </p>
                </div>
                <div className="audio-player__full-page-options">
                  <IconButton
                    onClick={toggleOptions}
                    text={isOptionsActive ? 'Show Info' : 'Show Cover'}
                    ariaLabel={isOptionsActive ? 'Show Info' : 'Show Cover'}
                  >
                    {isOptionsActive ? <IoOptionsSharp /> : <LuDisc3 />}
                  </IconButton>
                </div>
              </div>
              
              <H5AudioPlayer
                ref={fullPageProgressRef}
                className="smooth-progress-bar smooth-progress-bar--full-page"
                autoPlayAfterSrcChange={false}
                src={audioSrc}
                {...preventDefaultAudioEvents}
                customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
                onLoadedMetadata={() => {
                  requestAnimationFrame(() => syncAllPlayers(true));
                }}
                customControlsSection={[
                  <>
                    <IconButton
                      onClick={toggleWaveform}
                      text={waveform ? 'Hide waveform' : 'Show waveform'}
                      ariaLabel={waveform ? 'Hide waveform' : 'Show waveform'}
                    >
                      <PiWaveform className={waveform ? 'icon-primary' : ''} />
                    </IconButton>
                    <ShuffleButton shuffle={shuffle} setShuffle={setShuffle} />
                    <PrevButton onPrev={handlePrevClick} />
                    <PlayPauseButton isPlaying={isPlaying} setIsPlaying={handlePlayPause} />
                    <NextButton onNext={onNext} />
                    <RepeatButton repeat={repeat} setRepeat={setRepeat} />
                    <IconButton
                      onClick={toggleLyricsModal}
                      text={lyricsModal ? 'Hide lyrics' : 'Show lyrics'}
                      ariaLabel={lyricsModal ? 'Hide lyrics' : 'Show lyrics'}
                    >
                      <LiaMicrophoneAltSolid className={lyricsModal ? 'icon-primary' : ''} />
                    </IconButton>
                  </>
                ]}
                style={{ marginBottom: '20px' }}
              />
              
              <div ref={waveformRefFullPage} className={`waveform ${waveform ? 'waveform--active' : ''}`}></div>
            </div>
          </div>
        </>
      )}

      {/* Mobile bottom audio player */}
      {!shouldShowFullPagePlayer && (
        shouldShowMobilePlayer ? (
          <div
            className={`audio-player audio-player--mobile ${lyricsModal ? 'audio-player--lyrics-modal-open' : ''}`}
            onClick={toggleFullPagePlayer}
          >
            <H5AudioPlayer
              ref={mobilePlayerRef}
              className="smooth-progress-bar smooth-progress-bar--mobile"
              autoPlayAfterSrcChange={false}
              src={audioSrc}
              {...preventDefaultAudioEvents}
              customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
              customControlsSection={[]}
            />
            
            <div  className="audio-player__text" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={handleTouchMove} style={{ transform: `translateX(${dragPosition}px)` }}>
              <p className="audio-player__title">{currentBeat.title}</p>
              <p className="audio-player__artist">{artistName}</p>
            </div>
            <PlayPauseButton isPlaying={isPlaying} setIsPlaying={handlePlayPause} className="small" />
          </div>
        ) : (
          <div className="audio-player">
            {/* Desktop bottom audio player */}
            <div className='audio-player__text audio-player__text--desktop' style={{ flex: '1' }}>
              <p className="audio-player__title">{currentBeat.title}</p>
              <p className="audio-player__artist">{artistName}</p>
            </div>
            <div style={{ flex: '3' }}>
              <H5AudioPlayer
                ref={desktopPlayerRef}
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