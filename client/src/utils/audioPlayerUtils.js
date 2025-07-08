import React from 'react';
import { slideIn, slideOut } from './';

/**
 * Format time in seconds to MM:SS format
 * @param {number} time - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
  if (isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Creates slide content for the full page player
 * @param {Object} currentBeat - Current beat object
 * @returns {Array} Array of slide objects
 */
export const createSlides = (currentBeat) => [
  {
    id: 'image',
    content: (
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
    )
  },
  {
    id: 'info',
    content: (
      <div className="audio-player__full-page-info-content">
        <p className="audio-player__full-page-description">
          {currentBeat.description || 'No description available.'}
        </p>
      </div>
    )
  }
];

/**
 * Toggle full page player visibility with animation
 * @param {boolean} isFullPage - Current full page state
 * @param {Function} setIsFullPage - State setter for isFullPage
 * @param {boolean} isFullPageVisible - Current visibility state
 * @param {Function} setIsFullPageVisible - State setter for isFullPageVisible
 * @param {Object} fullPagePlayerRef - Ref to full page player element
 * @param {Object} fullPageOverlayRef - Ref to full page overlay element
 * @param {boolean} lyricsModal - Whether lyrics modal is open
 * @param {boolean} isMobileOrTablet - Whether device is mobile or tablet
 * @param {boolean} isReturningFromLyrics - Whether returning from lyrics modal
 * @param {Function} setIsReturningFromLyrics - State setter for isReturningFromLyrics
 * @returns {void}
 */
export const toggleFullPagePlayer = ({
  isFullPage,
  setIsFullPage,
  isFullPageVisible,
  setIsFullPageVisible,
  fullPagePlayerRef,
  fullPageOverlayRef,
  lyricsModal,
  isMobileOrTablet,
  isReturningFromLyrics,
  setIsReturningFromLyrics
}) => {
  // Don't allow opening full page player when lyrics modal is open on mobile
  if (isMobileOrTablet && lyricsModal) {
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

/**
 * Sync all display players with main audio element
 * @param {Object} playerRef - Reference to main player
 * @param {Function} setCurrentTimeState - State setter for current time
 * @param {Function} setDuration - State setter for duration
 * @param {Function} setProgress - State setter for progress
 * @param {Object} wavesurfer - Reference to wavesurfer instance
 * @param {boolean} shouldShowMobilePlayer - Whether mobile player should be shown
 * @param {Object} mobilePlayerRef - Reference to mobile player
 * @param {boolean} isMobileOrTablet - Whether device is mobile or tablet
 * @param {Object} desktopPlayerRef - Reference to desktop player
 * @param {boolean} shouldShowFullPagePlayer - Whether full page player should be shown
 * @param {boolean} isFullPageVisible - Whether full page player is visible
 * @param {Object} fullPageProgressRef - Reference to full page progress bar
 * @param {boolean} forceUpdate - Whether to force update
 */
export const syncAllPlayers = ({
  playerRef,
  setCurrentTimeState,
  setDuration,
  setProgress,
  wavesurfer,
  shouldShowMobilePlayer,
  mobilePlayerRef,
  isMobileOrTablet,
  desktopPlayerRef,
  shouldShowFullPagePlayer,
  isFullPageVisible,
  fullPageProgressRef,
  forceUpdate = false
}) => {
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
  if (!isMobileOrTablet) {
    updateProgressBar(desktopPlayerRef);
  }
  if (shouldShowFullPagePlayer && isFullPageVisible) {
    updateProgressBar(fullPageProgressRef);
  }
}; 