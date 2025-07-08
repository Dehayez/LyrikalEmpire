import { useEffect } from 'react';

export const useMediaSession = ({
  handlePlayPause,
  handlePrevClick,
  onNext
}) => {
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
  }, [handlePlayPause, handlePrevClick, onNext]);
}; 