import React, { useState, useEffect } from 'react';
import { Header, BeatList, AddBeatForm, AddBeatButton, AudioPlayer } from './components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

function App() {
  const [refresh, setRefresh] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [beats, setBeats] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [audioPlayerHeight, setAudioPlayerHeight] = useState(0);
  const [addBeatButtonBottom, setAddBeatButtonBottom] = useState(20);
  const [animateAddButton, setAnimateAddButton] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [hasBeatPlayed, setHasBeatPlayed] = useState(false);
  const [emptySpaceHeight, setEmptySpaceHeight] = useState(0);
  const [lastPlayedIndex, setLastPlayedIndex] = useState(null);

  useEffect(() => {
    const audioPlayer = document.getElementById('audio-player');
    const mainContent = document.getElementById('main-content');
    if (audioPlayer && mainContent && hasBeatPlayed) {
      const audioPlayerHeight = audioPlayer.offsetHeight;
      mainContent.style.paddingBottom = `${audioPlayerHeight}px`;
      setAudioPlayerHeight(audioPlayerHeight);
      setAddBeatButtonBottom(audioPlayerHeight + 20);
      setEmptySpaceHeight(audioPlayerHeight);
    } else if (!hasBeatPlayed) {
      setEmptySpaceHeight(0);
    }
  }, [currentBeat, hasBeatPlayed]);

  const handleAdd = () => setRefresh(!refresh);

  const handlePlay = (beat, play, beats) => {
    setSelectedBeat(beat);
    setBeats(beats);
    if (!beat) {
      setCurrentBeat(null);
      setIsPlaying(false);
    } else if (currentBeat && currentBeat.id === beat.id) {
      setIsPlaying(play);
    } else {
      setCurrentBeat(beat);
      setIsPlaying(true);
      setHasBeatPlayed(true);
    }
  };

  const handleNext = () => {
    if (repeat === 'Repeat One') {
      setRepeat('Repeat');
    }
    let nextIndex;
    if (shuffle) {
      do {
        nextIndex = Math.floor(Math.random() * beats.length);
      } while (nextIndex === lastPlayedIndex && beats.length > 1);
    } else {
      const currentIndex = beats.findIndex(beat => beat.id === currentBeat.id);
      nextIndex = (currentIndex + 1) % beats.length;
    }
    setLastPlayedIndex(nextIndex);
    if (repeat === 'Disabled Repeat' && nextIndex === 0) {
      handlePlay(beats[nextIndex], true, beats);
      setTimeout(() => setIsPlaying(false), 1);
    } else {
      handlePlay(beats[nextIndex], true, beats);
    }
  };

  const handlePrev = () => {
    if (repeat === 'Repeat One') {
      handlePlay(currentBeat, true, beats);
      return;
    }
    const currentIndex = beats.findIndex(beat => beat.id === currentBeat.id);
    const prevIndex = (currentIndex - 1 + beats.length) % beats.length;
    handlePlay(beats[prevIndex], true, beats);
  };

  const [shuffle, setShuffle] = useState(() => {
    const savedShuffle = localStorage.getItem('shuffle');
    return savedShuffle !== null ? JSON.parse(savedShuffle) : false;
  });
  const [repeat, setRepeat] = useState(() => {
    const savedRepeat = localStorage.getItem('repeat');
    return savedRepeat !== null ? savedRepeat : 'Disabled Repeat';
  });

  useEffect(() => {
    localStorage.setItem('shuffle', shuffle);
  }, [shuffle]);

  useEffect(() => {
    localStorage.setItem('repeat', repeat);
  }, [repeat]);

  return (
    <div className="App">
      <ToastContainer />
      <div className="container" id="main-content">
        <Header />
        <AddBeatForm onAdd={handleAdd} isOpen={isOpen} setIsOpen={setIsOpen} />
        <BeatList key={refresh} onPlay={handlePlay} selectedBeat={selectedBeat} isPlaying={isPlaying} />
        <div className="buffer"/> 
        <AddBeatButton setIsOpen={setIsOpen} addBeatButtonBottom={addBeatButtonBottom} animateAddButton={animateAddButton} setAnimateAddButton={setAnimateAddButton} />
      </div>
      <AudioPlayer currentBeat={currentBeat} setCurrentBeat={setCurrentBeat} isPlaying={isPlaying} setIsPlaying={setIsPlaying} onNext={handleNext} onPrev={handlePrev} volume={volume} setVolume={setVolume} shuffle={shuffle} setShuffle={setShuffle} repeat={repeat} setRepeat={setRepeat} />
    </div>
  );
}

export default App;