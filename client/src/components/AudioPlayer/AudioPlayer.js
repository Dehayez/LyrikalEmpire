import React, { useEffect, useRef, useState } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import WaveSurfer from 'wavesurfer.js';

import { isMobileOrTablet, slideIn, slideOut, createSlides, syncAllPlayers as syncAllPlayersUtil } from '../../utils';
import { useAudioPlayer, useLocalStorageSync, useDragToDismiss } from '../../hooks';
import { getSignedUrl, getUserById } from '../../services';
import { usePlaylist } from '../../contexts';

import { ContextMenu } from '../ContextMenu';
import MobileAudioPlayer from './MobileAudioPlayer';
import DesktopAudioPlayer from './DesktopAudioPlayer';
import FullPageAudioPlayer from './FullPageAudioPlayer';
import { 
  handleSwipeTouchStart, 
  handleSwipeTouchMove, 
  handleSwipeTouchEnd, 
  handleSwipeMouseDown,
  handleSwipeMouseMove,
  handleSwipeMouseUp,
  updateSwipeTransform
} from './AudioPlayerSwipeHandlers';

import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.scss';
import { IoAddSharp, IoRemoveCircleOutline } from 'react-icons/io5';
import { Queue02 } from '../../assets/icons';

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

  // Swipeable content refs
  const swipeableContainerRef = useRef(null);
  const swipeStartX = useRef(0);
  const swipeCurrentX = useRef(0);
  const isSwipeDragging = useRef(false);
  
  const [artistName, setArtistName] = useState('Unknown Artist');
  const [activeContextMenu, setActiveContextMenu] = useState(false);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTimeState, setCurrentTimeState] = useState(0);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isReturningFromLyrics, setIsReturningFromLyrics] = useState(false);
  
  // Replace isOptionsActive with activeSlideIndex for swipeable content
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [audioSrc, setAudioSrc] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);
  const [waveform, setWaveform] = useState(() => JSON.parse(localStorage.getItem('waveform')) || false);
  const [isFullPage, setIsFullPage] = useState(() => {
    return JSON.parse(localStorage.getItem('isFullPage')) || false;
  });
  const [isFullPageVisible, setIsFullPageVisible] = useState(false);

  // Generate slides for the full page player
  const slides = createSlides(currentBeat);

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

  // Swipeable content handlers
  const handleSwipeTouchStartWrapper = (e) => {
    handleSwipeTouchStart(e, swipeStartX, isSwipeDragging, swipeableContainerRef);
  };

  const handleSwipeTouchMoveWrapper = (e) => {
    handleSwipeTouchMove(e, swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex);
  };

  const handleSwipeTouchEndWrapper = () => {
    handleSwipeTouchEnd(swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex, setActiveSlideIndex, slides.length);
  };

  const handleSwipeMouseDownWrapper = (e) => {
    handleSwipeMouseDown(e, swipeStartX, isSwipeDragging, swipeableContainerRef);
  };

  const handleSwipeMouseMoveWrapper = (e) => {
    handleSwipeMouseMove(e, swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex);
  };

  const handleSwipeMouseUpWrapper = () => {
    handleSwipeMouseUp(swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex, setActiveSlideIndex, slides.length);
  };

  const goToSlide = (index) => {
    setActiveSlideIndex(index);
  };

  // Add mouse event listeners to document for desktop drag
  useEffect(() => {
    const handleDocumentMouseMove = (e) => handleSwipeMouseMoveWrapper(e);
    const handleDocumentMouseUp = () => handleSwipeMouseUpWrapper();

    if (isSwipeDragging.current) {
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [activeSlideIndex]);

  useEffect(() => {
    updateSwipeTransform(swipeableContainerRef, activeSlideIndex);
  }, [activeSlideIndex]);

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
    syncAllPlayersUtil({
      playerRef,
      setCurrentTimeState,
      setDuration,
      setProgress,
      wavesurfer,
      shouldShowMobilePlayer,
      mobilePlayerRef,
      isMobileOrTablet: isMobileOrTablet(),
      desktopPlayerRef,
      shouldShowFullPagePlayer,
      isFullPageVisible,
      fullPageProgressRef,
      forceUpdate
    });
  };

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

    mainAudio.addEventListener('timeupdate', handleTimeUpdate);
    mainAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
    mainAudio.addEventListener('loadeddata', handleLoadedData);
    mainAudio.addEventListener('canplay', handleCanPlay);
    mainAudio.addEventListener('play', handlePlay);
    mainAudio.addEventListener('pause', handlePause);
    
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
    };
  }, [playerRef.current?.audio.current, onNext, setIsPlaying]);

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
        <FullPageAudioPlayer
          fullPagePlayerRef={fullPagePlayerRef}
          fullPageOverlayRef={fullPageOverlayRef}
          playerRef={fullPageProgressRef}
          audioSrc={audioSrc}
          currentBeat={currentBeat}
          isPlaying={isPlaying}
          handlePlayPause={handlePlayPause}
          handlePrevClick={handlePrevClick}
          onNext={onNext}
          preventDefaultAudioEvents={preventDefaultAudioEvents}
          artistName={artistName}
          shuffle={shuffle}
          setShuffle={setShuffle}
          repeat={repeat}
          setRepeat={setRepeat}
          toggleWaveform={toggleWaveform}
          toggleLyricsModal={toggleLyricsModal}
          waveform={waveform}
          waveformRef={waveformRefFullPage}
          syncAllPlayers={syncAllPlayers}
          lyricsModal={lyricsModal}
          isFullPageVisible={isFullPageVisible}
          toggleFullPagePlayer={toggleFullPagePlayer}
          handleDragStart={handleDragStart}
          handleDragMove={handleDragMove}
          handleDragEnd={handleDragEnd}
          playedPlaylistTitle={playedPlaylistTitle}
          handleEllipsisClick={handleEllipsisClick}
          swipeableContainerRef={swipeableContainerRef}
          activeSlideIndex={activeSlideIndex}
          slides={slides}
          handleSwipeTouchStart={handleSwipeTouchStartWrapper}
          handleSwipeTouchMove={handleSwipeTouchMoveWrapper}
          handleSwipeTouchEnd={handleSwipeTouchEndWrapper}
          handleSwipeMouseDown={handleSwipeMouseDownWrapper}
          goToSlide={goToSlide}
        />
      )}

      {/* Mobile bottom audio player */}
      {!shouldShowFullPagePlayer && (
        shouldShowMobilePlayer ? (
          <MobileAudioPlayer
            playerRef={mobilePlayerRef}
            audioSrc={audioSrc}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            handlePlayPause={handlePlayPause}
            preventDefaultAudioEvents={preventDefaultAudioEvents}
            artistName={artistName}
            toggleFullPagePlayer={toggleFullPagePlayer}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            dragPosition={dragPosition}
            lyricsModal={lyricsModal}
            syncAllPlayers={syncAllPlayers}
          />
        ) : (
          <DesktopAudioPlayer
            playerRef={desktopPlayerRef}
            audioSrc={audioSrc}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            handlePlayPause={handlePlayPause}
            handlePrevClick={handlePrevClick}
            onNext={onNext}
            preventDefaultAudioEvents={preventDefaultAudioEvents}
            artistName={artistName}
            shuffle={shuffle}
            setShuffle={setShuffle}
            repeat={repeat}
            setRepeat={setRepeat}
            toggleWaveform={toggleWaveform}
            toggleLyricsModal={toggleLyricsModal}
            volume={volume}
            handleVolumeChange={handleVolumeChange}
            waveform={waveform}
            waveformRef={waveformRefDesktop}
            syncAllPlayers={syncAllPlayers}
            lyricsModal={lyricsModal}
          />
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