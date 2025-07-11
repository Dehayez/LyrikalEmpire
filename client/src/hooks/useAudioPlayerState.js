import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorageSync } from './useLocalStorageSync';
import { isMobileOrTablet } from '../utils';
import { getSignedUrl, getUserById, audioCacheService } from '../services';

export const useAudioPlayerState = ({
  currentBeat,
  lyricsModal,
  setLyricsModal,
  markBeatAsCached
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
  const [audioSrc, setAudioSrc] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isCachedAudio, setIsCachedAudio] = useState(false);
  const [waveform, setWaveform] = useState(() => JSON.parse(localStorage.getItem('waveform')) || false);
  const [isFullPage, setIsFullPage] = useState(() => {
    return JSON.parse(localStorage.getItem('isFullPage')) || false;
  });
  const [isFullPageVisible, setIsFullPageVisible] = useState(false);

  // Sync local storage
  useLocalStorageSync({ waveform, isFullPage });

  // Get derived state
  const shouldShowFullPagePlayer = isFullPage || isFullPageVisible;
  const shouldShowMobilePlayer = isMobileOrTablet();

  // Get artist name from cache or fetch
  useEffect(() => {
    const fetchArtistName = async () => {
      if (currentBeat?.user_id) {
        // Check cache first
        if (artistCache.current.has(currentBeat.user_id)) {
          setArtistName(artistCache.current.get(currentBeat.user_id));
          return;
        }

        try {
          const user = await getUserById(currentBeat.user_id);
          const username = user?.username || 'Unknown Artist';
          
          // Cache the result
          artistCache.current.set(currentBeat.user_id, username);
          setArtistName(username);
        } catch (error) {
          // Could not fetch artist name. Using fallback.
          setArtistName('Unknown Artist');
        }
      }
    };

    fetchArtistName();
  }, [currentBeat?.user_id]);

  // Handle audio source changes with caching
  useEffect(() => {
    const updateAudioSource = async () => {
      if (currentBeat?.audio && currentBeat?.user_id) {
        // First, clear the current audio source to prevent old audio from playing
        setAudioSrc('');
        setIsLoadingAudio(true);
        setIsCachedAudio(false);
        
        try {
          // First, check if audio is already cached
          const cachedAudio = await audioCacheService.getAudio(currentBeat.user_id, currentBeat.audio);
          
          if (cachedAudio) {
            // Use cached audio immediately - no API call needed
            setAudioSrc(cachedAudio);
            setIsCachedAudio(true);
            setAutoPlay(!isFirstRender);
            setIsFirstRender(false);
            
            // Update the cache indicators state
            if (markBeatAsCached) {
              markBeatAsCached(currentBeat);
            }
          } else {
            // Not cached, get signed URL and start caching process
            const signedUrl = await getSignedUrl(currentBeat.user_id, currentBeat.audio);
            
            // Set signed URL as audio source
            setAudioSrc(signedUrl);
            setIsCachedAudio(false);
            setAutoPlay(!isFirstRender);
            setIsFirstRender(false);
            
            // Try to preload and cache the audio in background (non-blocking)
            audioCacheService.preloadAudio(
              currentBeat.user_id, 
              currentBeat.audio, 
              signedUrl
            ).then((cachedObjectUrl) => {
              // Update to cached version once available (if still the same beat)
              if (currentBeat?.audio === currentBeat.audio && currentBeat?.user_id === currentBeat.user_id) {
                setAudioSrc(cachedObjectUrl);
                setIsCachedAudio(true);
                // Update the cache indicators state
                if (markBeatAsCached) {
                  markBeatAsCached(currentBeat);
                }
              }
            }).catch((cacheError) => {
              // Silently fail caching - we're already using the direct URL
              // Background caching failed
            });
          }
          
        } catch (error) {
          // Error loading audio
          setAudioSrc('');
          setIsCachedAudio(false);
        } finally {
          setIsLoadingAudio(false);
        }
      } else {
        // Clear audio source if no beat
        setAudioSrc('');
        setIsCachedAudio(false);
        setIsLoadingAudio(false);
      }
    };

    updateAudioSource();
  }, [currentBeat?.audio, currentBeat?.user_id, isFirstRender, markBeatAsCached]);

  // Handlers
  const toggleLyricsModal = useCallback(() => {
    setLyricsModal(!lyricsModal);
  }, [lyricsModal, setLyricsModal]);

  const toggleWaveform = useCallback(() => {
    setWaveform(!waveform);
  }, [waveform]);

  const handleEllipsisClick = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setContextMenuX(rect.left);
    setContextMenuY(rect.bottom);
    setActiveContextMenu(true);
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setActiveContextMenu(false);
  }, []);

  const handleAudioReady = useCallback(() => {
    // Audio is ready, can perform any setup here
  }, []);

  return {
    // Refs
    waveformRefDesktop,
    waveformRefFullPage,
    fullPageOverlayRef,
    wavesurfer,
    mobilePlayerRef,
    desktopPlayerRef,
    fullPageProgressRef,
    
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
    audioSrc,
    autoPlay,
    isLoadingAudio,
    isCachedAudio,
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
    handleCloseContextMenu,
    handleAudioReady
  };
}; 