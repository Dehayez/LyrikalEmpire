import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorageSync } from './useLocalStorageSync';
import { isMobileOrTablet } from '../utils';
import { getSignedUrl, getUserById } from '../services';

export const useAudioPlayerState = ({
  currentBeat,
  setCurrentBeat,
  isPlaying,
  setIsPlaying,
  lyricsModal,
  setLyricsModal
}) => {
  // Refs
  const artistCache = useRef(new Map());
  const waveformRefDesktop = useRef(null);
  const waveformRefFullPage = useRef(null);
  const fullPageOverlayRef = useRef(null);
  const wavesurfer = useRef(null);
  const mobilePlayerRef = useRef(null);
  const desktopPlayerRef = useRef(null);
  const fullPageProgressRef = useRef(null);
  const swipeableContainerRef = useRef(null);
  const swipeStartX = useRef(0);
  const swipeCurrentX = useRef(0);
  const isSwipeDragging = useRef(false);

  // State
  const [artistName, setArtistName] = useState('Unknown Artist');
  const [activeContextMenu, setActiveContextMenu] = useState(false);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTimeState, setCurrentTimeState] = useState(0);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isReturningFromLyrics, setIsReturningFromLyrics] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [audioSrc, setAudioSrc] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);
  const [waveform, setWaveform] = useState(() => JSON.parse(localStorage.getItem('waveform')) || false);
  const [isFullPage, setIsFullPage] = useState(() => {
    return JSON.parse(localStorage.getItem('isFullPage')) || false;
  });
  const [isFullPageVisible, setIsFullPageVisible] = useState(false);

  // Sync local storage
  useLocalStorageSync({ waveform, isFullPage });

  // Derived state
  const shouldShowFullPagePlayer = isFullPage && !(isMobileOrTablet() && lyricsModal);
  const shouldShowMobilePlayer = !shouldShowFullPagePlayer && isMobileOrTablet();

  // Handlers
  const toggleLyricsModal = useCallback(() => setLyricsModal(prev => !prev), [setLyricsModal]);
  const toggleWaveform = useCallback(() => setWaveform(prev => !prev), []);
  
  const handleEllipsisClick = useCallback((e) => {
    e.stopPropagation();
    const buttonRect = e.currentTarget.getBoundingClientRect();
    setContextMenuX(buttonRect.left);
    setContextMenuY(buttonRect.bottom);
    setActiveContextMenu(true);
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setActiveContextMenu(false);
  }, []);

  // Fetch artist name and audio URL
  useEffect(() => {
    const fetchArtistName = async () => {
      if (currentBeat?.user_id) {
        if (artistCache.current.has(currentBeat.user_id)) {
          setArtistName(artistCache.current.get(currentBeat.user_id));
        } else {
          try {
            const user = await getUserById(currentBeat.user_id);
            const name = user?.username || 'Unknown Artist';
            setArtistName(name);
            artistCache.current.set(currentBeat.user_id, name);
          } catch (error) {
            console.warn('Could not fetch artist name. Using fallback.', error);
          }
        }
      }
    };

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
        } catch (error) {
          console.error('Error fetching signed URL:', error);
        }
      }
    };

    fetchArtistName();
    fetchSignedUrl();
  }, [currentBeat, isFirstRender]);

  // Set up media session metadata
  useEffect(() => {
    if ('mediaSession' in navigator && currentBeat) {
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
  }, [currentBeat, artistName]);

  return {
    // Refs
    waveformRefDesktop,
    waveformRefFullPage,
    fullPageOverlayRef,
    wavesurfer,
    mobilePlayerRef,
    desktopPlayerRef,
    fullPageProgressRef,
    swipeableContainerRef,
    swipeStartX,
    swipeCurrentX,
    isSwipeDragging,
    
    // State
    artistName,
    activeContextMenu,
    contextMenuX,
    contextMenuY,
    progress,
    setProgress,
    duration,
    setDuration,
    currentTimeState,
    setCurrentTimeState,
    isReturningFromLyrics,
    setIsReturningFromLyrics,
    activeSlideIndex,
    setActiveSlideIndex,
    audioSrc,
    autoPlay,
    waveform,
    isFullPage,
    setIsFullPage,
    isFullPageVisible,
    setIsFullPageVisible,
    
    // Derived state
    shouldShowFullPagePlayer,
    shouldShowMobilePlayer,
    
    // Handlers
    toggleLyricsModal,
    toggleWaveform,
    handleEllipsisClick,
    handleCloseContextMenu
  };
}; 