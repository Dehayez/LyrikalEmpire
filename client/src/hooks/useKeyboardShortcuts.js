import { useEffect } from 'react';
import useOs from './useOs';

const useKeyboardShortcuts = ({
  onToggleFullscreen,
  onToggleLyrics,
  onToggleWaveform,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onFocusSearch,
  onToggleEditMode,
  isInputFocused = false
}) => {
  const os = useOs();
  const isMac = os === 'mac';
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isInput = event.target.tagName.toLowerCase() === 'input' || event.target.tagName.toLowerCase() === 'textarea';
      if (isInput) return;
      // Fullscreen: F
      if (event.key.toLowerCase() === 'f' && onToggleFullscreen) {
        event.preventDefault();
        onToggleFullscreen();
        return;
      }
      // Lyrics Modal: L
      if (event.key.toLowerCase() === 'l' && onToggleLyrics) {
        event.preventDefault();
        onToggleLyrics();
        return;
      }
      // Waveform: W
      if (event.key.toLowerCase() === 'w' && onToggleWaveform) {
        event.preventDefault();
        onToggleWaveform();
        return;
      }
      // Mute: M
      if (event.key.toLowerCase() === 'm' && onToggleMute) {
        event.preventDefault();
        onToggleMute();
        return;
      }
      // Shuffle: S
      if (event.key.toLowerCase() === 's' && onToggleShuffle) {
        event.preventDefault();
        onToggleShuffle();
        return;
      }
      // Repeat: R
      if (event.key.toLowerCase() === 'r' && onToggleRepeat) {
        event.preventDefault();
        onToggleRepeat();
        return;
      }
      // Listen/Edit Mode: E
      if (event.key.toLowerCase() === 'e' && onToggleEditMode) {
        event.preventDefault();
        onToggleEditMode();
        return;
      }
      // Focus search: K
      if (event.key.toLowerCase() === 'k' && onFocusSearch) {
        event.preventDefault();
        onFocusSearch();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onToggleFullscreen,
    onToggleLyrics,
    onToggleWaveform,
    onToggleMute,
    onToggleShuffle,
    onToggleRepeat,
    onFocusSearch,
    onToggleEditMode
  ]);

  // Return shortcut text based on OS
  const getShortcutText = (key) => {
    return isMac ? `⌘${key}` : `Ctrl+${key}`;
  };

  return {
    shortcutTexts: {
      toggleFullscreen: 'F',
      toggleLyrics: 'L',
      toggleWaveform: 'W',
      toggleMute: 'M',
      toggleShuffle: 'S',
      toggleRepeat: 'R',
      focusSearch: 'K',
      toggleEditMode: 'E'
    }
  };
};

export default useKeyboardShortcuts; 