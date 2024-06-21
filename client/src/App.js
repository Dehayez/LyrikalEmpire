import React, { useState, useEffect } from 'react';
import { getBeats } from './services';
import { Header, BeatList, AddBeatForm, AddBeatButton, AudioPlayer } from './components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

function App() {
  const [refresh, setRefresh] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beats, setBeats] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [addBeatButtonBottom, setAddBeatButtonBottom] = useState(20);
  const [animateAddButton, setAnimateAddButton] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [hasBeatPlayed, setHasBeatPlayed] = useState(false);
  const [lastPlayedIndex, setLastPlayedIndex] = useState(null);
  const [audioPlayerLoaded, setAudioPlayerLoaded] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(() => {
    const savedCurrentBeat = localStorage.getItem('currentBeat');
    return savedCurrentBeat !== null ? JSON.parse(savedCurrentBeat) : null;
  });
  const [selectedBeat, setSelectedBeat] = useState(() => {
    const savedBeat = localStorage.getItem('selectedBeat');
    return savedBeat !== null ? JSON.parse(savedBeat) : null;
  });
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
    localStorage.setItem('repeat', repeat);
    localStorage.setItem('currentBeat', JSON.stringify(currentBeat));
    localStorage.setItem('selectedBeat', JSON.stringify(selectedBeat));
  }, [shuffle, repeat, currentBeat, selectedBeat]);

  useEffect(() => {
    const fetchBeats = async () => {
      const fetchedBeats = await getBeats();
      setBeats(fetchedBeats);
      if (fetchedBeats.length > 0 && !selectedBeat) {
        setSelectedBeat(fetchedBeats[0]);
      }
    };
    fetchBeats();
  }, []);

  useEffect(() => {
    const audioPlayer = document.getElementById('audio-player');
    if (audioPlayer) {
      const observer = new MutationObserver(adjustButtonPosition);
      observer.observe(audioPlayer, { attributes: true, childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [audioPlayerLoaded]);

  const adjustButtonPosition = () => {
    const audioPlayer = document.getElementById('audio-player');
    if (audioPlayer) {
      const audioPlayerRect = audioPlayer.getBoundingClientRect();
      setAddBeatButtonBottom(audioPlayerRect.height + 20);
    }
  };

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