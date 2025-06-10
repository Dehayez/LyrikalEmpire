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
  
  // Refs for all H5AudioPlayer instances to keep them in sync
  const mobilePlayerRef = useRef(null);
  const desktopPlayerRef = useRef(null);
  const fullPageProgressRef = useRef(null);
  
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

  // Sync all player instances with the main player
  const syncAllPlayers = () => {
    if (!playerRef.current?.audio.current) return;
    
    const mainAudio = playerRef.current.audio.current;
    const currentTime = mainAudio.currentTime;
    const duration = mainAudio.duration;
    
    // Sync all other player instances
    const playersToSync = [
      mobilePlayerRef.current?.audio.current,
      desktopPlayerRef.current?.audio.current,
      fullPageProgressRef.current?.audio.current
    ].filter(Boolean);

    playersToSync.forEach(audio => {
      if (Math.abs(audio.currentTime - currentTime) > 0.1) {
        audio.currentTime = currentTime;
      }
    });

    // Update waveform progress
    if (wavesurfer.current && duration > 0) {
      wavesurfer.current.seekTo(currentTime / duration);
    }

    setProgress(currentTime / duration);
  };

  // Effect to handle initial slide-in when full page becomes active
  useEffect(() => {
    if (isFullPage && fullPagePlayerRef.current && !isFullPageVisible) {
      setIsFullPageVisible(true);
      slideIn(fullPagePlayerRef.current);
    } else if (!isFullPage) {
      syncAllPlayers();
    }

    // Sync the full-page audio player progress
    const fullPageAudio = fullPageProgressRef.current?.audio?.current;
    const mainAudio = playerRef.current?.audio?.current;
    if (fullPageAudio && mainAudio) {
      fullPageAudio.currentTime = mainAudio.currentTime;
    }
  }, [isFullPage, isFullPageVisible]);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (currentBeat?.audio) {
        try {
          setAudioSrc('');
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
      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
        navigator.mediaSession.playbackState = 'playing';
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
        navigator.mediaSession.playbackState = 'paused';
      });
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
  }, [setIsPlaying, handlePrevClick, onNext]);

  // Main synchronization effect - runs on every time update
  useEffect(() => {
    const audio = playerRef.current?.audio.current;
    if (!audio) return;

    const updateProgress = () => {
      setDuration(audio.duration || 0);
      syncAllPlayers();
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [playerRef, audioSrc]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const loadWaveform = async () => {
      const container = isFullPage ? waveformRefFullPage.current : waveformRefDesktop.current;

      if (container && audioSrc) {
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
            if (!isNaN(currentTime) && duration > 0) {
              wavesurfer.current.seekTo(currentTime / duration);
            }
          });
        } catch (error) {
          if (error.name !== 'AbortError') console.error("Error loading audio source:", error);
        }
      }
    };

    const timer = setTimeout(loadWaveform, 100);
    return () => {
      clearTimeout(timer);
      controller.abort();
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioSrc, isFullPage]);

  // Update waveform position when currentTime changes
  useEffect(() => {
    if (wavesurfer.current && duration > 0) {
      wavesurfer.current.seekTo(currentTime / duration);
    }
  }, [currentTime, duration]);

  useEffect(() => {
    const container = document.querySelector('.rhap_progress-container');
    const waveformEl = isFullPage ? waveformRefFullPage.current : waveformRefDesktop.current;

    if (container && waveformEl && !container.contains(waveformEl)) {
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
  }, [waveform, isFullPage]);

  const handlePlayClick = () => {
    setAutoPlay(true);
    setIsPlaying(true);
  };

  const handlePauseClick = () => {
    setIsPlaying(false);
  };

  // Enhanced play/pause handlers that sync all players
  const handlePlayPause = (play) => {
    setIsPlaying(play);
    const mainAudio = playerRef.current?.audio.current;
    if (mainAudio) {
      if (play) {
        mainAudio.play();
      } else {
        mainAudio.pause();
      }
    }
  };

  return (
    <>
      {/* Hidden main audio player that controls everything */}
      <H5AudioPlayer
        ref={playerRef}
        src={audioSrc}
        autoPlayAfterSrcChange={autoPlay}
        onPlay={handlePlayClick}
        onPause={handlePauseClick}
        style={{ display: 'none' }}
      />

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
              
              {/* Full page progress bar - synced with main player */}
              <H5AudioPlayer
                ref={fullPageProgressRef}
                className="smooth-progress-bar smooth-progress-bar--full-page"
                autoPlayAfterSrcChange={false}
                src={audioSrc}
                onPlay={() => {}} // Prevent this from controlling playback
                onPause={() => {}} // Prevent this from controlling playback
                customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
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
              
              {/* Full page waveform */}
              <div ref={waveformRefFullPage} className={`waveform ${waveform ? 'waveform--active' : ''}`}></div>
            </div>
          </div>
        </>
      )}

      {!isFullPage && (
        isMobileOrTablet() ? (
          <div className="audio-player audio-player--mobile" onClick={toggleFullPagePlayer}>
            {/* Mobile progress bar - synced with main player */}
            <H5AudioPlayer
              ref={mobilePlayerRef}
              className="smooth-progress-bar smooth-progress-bar--mobile"
              autoPlayAfterSrcChange={false}
              src={audioSrc}
              onPlay={() => {}} // Prevent this from controlling playback
              onPause={() => {}} // Prevent this from controlling playback
              customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
              customControlsSection={[]}
            />
            
            {currentBeat && (
              <p className="audio-player__title" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={handleTouchMove} style={{ transform: `translateX(${dragPosition}px)` }}>
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
              {/* Desktop progress bar - synced with main player */}
              <H5AudioPlayer
                ref={desktopPlayerRef}
                className="smooth-progress-bar smooth-progress-bar--desktop"
                autoPlayAfterSrcChange={false}
                src={audioSrc}
                onPlay={() => {}} // Prevent this from controlling playback
                onPause={() => {}} // Prevent this from controlling playback
                customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
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
              {/* Desktop waveform */}
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