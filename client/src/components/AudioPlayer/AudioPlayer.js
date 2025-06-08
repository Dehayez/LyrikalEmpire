import React, { useEffect, useRef, useState } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import WaveSurfer from 'wavesurfer.js';
import { LiaMicrophoneAltSolid } from "react-icons/lia";
import { PiWaveform } from "react-icons/pi";
import { IoChevronDownSharp, IoEllipsisHorizontalSharp } from "react-icons/io5";

import { isMobileOrTablet } from '../../utils';
import { useAudioPlayer, useLocalStorageSync } from '../../hooks';
import { getSignedUrl, getUserById } from '../../services';

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

  const waveformRefDesktop = useRef(null);
  const waveformRefFullPage = useRef(null);
  const wavesurfer = useRef(null);
  const artistCache = useRef(new Map());

  const [audioSrc, setAudioSrc] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);
  const [waveform, setWaveform] = useState(() => JSON.parse(localStorage.getItem('waveform')) || false);
  const [isFullPage, setIsFullPage] = useState(false);

  useLocalStorageSync({ waveform });

  const toggleLyricsModal = () => setLyricsModal(prev => !prev);
  const toggleWaveform = () => setWaveform(prev => !prev);
  const toggleFullPagePlayer = () => setIsFullPage(prev => !prev);

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
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioSrc, isFullPage]);

  useEffect(() => {
    if (wavesurfer.current) {
      const duration = wavesurfer.current.getDuration();
      if (!isNaN(currentTime) && duration > 0) {
        wavesurfer.current.seekTo(currentTime / duration);
      }
    }
  }, [currentTime]);

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

  return (
    <>
      {isFullPage && (
        <div className="audio-player__full-page">
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
              {currentBeat ? currentBeat.title : 'Audio Player'}
            </p>
            <IconButton className="audio-player__ellipsis-button">
              <IoEllipsisHorizontalSharp />
            </IconButton>
          </div>
          <div className="audio-player__full-page-content">
            <div
              ref={waveformRefFullPage}
              className={`waveform ${waveform ? 'waveform--active' : ''}`}
            ></div>
            <H5AudioPlayer
              className="smooth-progress-bar smooth-progress-bar--full-page"
              autoPlayAfterSrcChange={autoPlay}
              src={audioSrc}
              ref={playerRef}
              onPlay={handlePlayClick}
              onPause={() => setIsPlaying(false)}
              customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
              customControlsSection={[
                <IconButton
                  className="audio-player__icon"
                  onClick={toggleWaveform}
                  text={waveform ? "Hide waveform" : "Show waveform"}
                  ariaLabel={waveform ? "Hide waveform" : "Show waveform"}
                >
                  <PiWaveform className={waveform ? 'icon-primary' : ''} />
                </IconButton>,
                <ShuffleButton shuffle={shuffle} setShuffle={setShuffle} />,
                <PrevButton onPrev={handlePrevClick} />,
                <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />,
                <NextButton onNext={onNext} />,
                <RepeatButton repeat={repeat} setRepeat={setRepeat} />,
                <IconButton
                  className="audio-player__icon"
                  onClick={toggleLyricsModal}
                  text={lyricsModal ? "Hide lyrics" : "Show lyrics"}
                  ariaLabel={lyricsModal ? "Hide lyrics" : "Show lyrics"}
                >
                  <LiaMicrophoneAltSolid className={lyricsModal ? 'icon-primary' : ''} />
                </IconButton>,
              ]}
            />
          </div>
        </div>
      )}

      {!isFullPage && (
        isMobileOrTablet() ? (
          <div className="audio-player audio-player--mobile" id="audio-player" onClick={toggleFullPagePlayer}>
            <H5AudioPlayer
              className="smooth-progress-bar smooth-progress-bar--mobile"
              autoPlayAfterSrcChange={autoPlay}
              src={audioSrc}
              ref={playerRef}
              onPlay={handlePlayClick}
              onPause={() => setIsPlaying(false)}
              customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
            />
            {currentBeat && (
              <p className="audio-player__title" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={handleTouchMove} style={{ transform: `translateX(${dragPosition}px)` }}>
                {currentBeat.title}
              </p>
            )}
            <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} className="small" />
          </div>
        ) : (
          <div className="audio-player" id="audio-player">
            <div className='audio-player__title audio-player__title--desktop' style={{ flex: '1' }}>
              {currentBeat && <p>{currentBeat.title}</p>}
            </div>
            <div style={{ flex: '3' }}>
              <H5AudioPlayer
                className="smooth-progress-bar smooth-progress-bar--desktop"
                autoPlayAfterSrcChange={autoPlay}
                src={audioSrc}
                ref={playerRef}
                onPlay={handlePlayClick}
                onPause={() => setIsPlaying(false)}
                customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]}
                customControlsSection={[
                  <ShuffleButton shuffle={shuffle} setShuffle={setShuffle} />,
                  <PrevButton onPrev={handlePrevClick} />,
                  <PlayPauseButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />,
                  <NextButton onNext={onNext} />,
                  <RepeatButton repeat={repeat} setRepeat={setRepeat} />,
                ]}
              />
              <div
                ref={waveformRefDesktop}
                className={`waveform ${waveform ? 'waveform--active' : ''}`}
              ></div>
            </div>
            <div className='audio-player__settings' style={{ flex: '1' }}>
              <IconButton
                className='audio-player__icon'
                onClick={toggleWaveform}
                text={waveform ? "Hide waveform" : "Show waveform"}
                ariaLabel={waveform ? "Hide waveform" : "Show waveform"}
              >
                <PiWaveform className={waveform ? 'icon-primary' : ''} />
              </IconButton>
              <IconButton
                className='audio-player__icon'
                onClick={toggleLyricsModal}
                text={lyricsModal ? "Hide lyrics" : "Show lyrics"}
                ariaLabel={lyricsModal ? "Hide lyrics" : "Show lyrics"}
              >
                <LiaMicrophoneAltSolid className={lyricsModal ? 'icon-primary' : ''} />
              </IconButton>
              <VolumeSlider volume={volume} handleVolumeChange={handleVolumeChange} />
            </div>
          </div>
        )
      )}
    </>
  );
};

export default AudioPlayer;