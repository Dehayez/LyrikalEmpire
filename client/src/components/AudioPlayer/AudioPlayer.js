import React, { useRef } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import { isMobileOrTablet, slideOut } from '../../utils';
import { 
  useAudioPlayer, 
  useDragToDismiss, 
  useAudioPlayerState,
  useWaveform,
  useFullPagePlayer,
  useMediaSession,
  useAudioSync
} from '../../hooks';
import { usePlaylist } from '../../contexts';

import { ContextMenu } from '../ContextMenu';
import MobileAudioPlayer from './MobileAudioPlayer';
import DesktopAudioPlayer from './DesktopAudioPlayer';
import FullPageAudioPlayer from './FullPageAudioPlayer';

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
  lyricsModal, setLyricsModal,
  onUpdateBeat
}) => {
  // Guard clause: Don't render if there's no current beat
  if (!currentBeat) {
    return null;
  }

  const playerRef = useRef();

  // Get playlists
  const { playlists, playedPlaylistTitle } = usePlaylist();

  // Get audio player functionality
  const {
    volume,
    handleVolumeChange,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    dragPosition,
    handlePrevClick,
    handlePlay,
    handleNext,
    handlePrev,
    currentTime,
  } = useAudioPlayer({
    currentBeat,
    setCurrentBeat,
    isPlaying,
    setIsPlaying,
    onNext,
    onPrev,
    shuffle,
    repeat,
  });

  // Get audio player state
  const {
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
  } = useAudioPlayerState({
    currentBeat,
    setCurrentBeat,
    isPlaying,
    setIsPlaying,
    lyricsModal,
    setLyricsModal
  });

  // Get full page drag dismiss functionality
  const {
    dismissRef: fullPagePlayerRef,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useDragToDismiss(() => {
      // Use the same toggle function that handles proper slide-out animation
      if (isFullPage) {
        slideOut(fullPagePlayerRef.current, fullPageOverlayRef.current, () => {
          setIsFullPage(false);
          setIsFullPageVisible(false);
        });
      }
    });

  // Get full page player functionality  
  const { toggleFullPagePlayer } = useFullPagePlayer({
    isFullPage,
    setIsFullPage,
    isFullPageVisible,
    setIsFullPageVisible,
    fullPagePlayerRef,
    fullPageOverlayRef,
    lyricsModal,
    isReturningFromLyrics,
    setIsReturningFromLyrics
  });

  // Get audio sync functionality
  const {
    syncAllPlayers,
    handleSeeked,
    preventDefaultAudioEvents,
    handlePlayPause
  } = useAudioSync({
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
    onNext,
    setIsPlaying,
    repeat,
    volume
  });

  // Set up media session
  useMediaSession({
    handlePlayPause,
    handlePrevClick,
    onNext
  });

  // Set up waveform
  useWaveform({
    audioSrc,
    isFullPage,
    waveform,
    wavesurfer,
    waveformRefDesktop,
    waveformRefFullPage,
    playerRef,
    isFullPageVisible
  });

  return (
    <>
      {/* Main audio player */}
      <H5AudioPlayer
        ref={playerRef}
        src={audioSrc}
        autoPlayAfterSrcChange={autoPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onCanPlay={handleAudioReady}
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
          onUpdateBeat={onUpdateBeat}
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