import React, { useState, useEffect } from 'react';
import { getBeats } from './services';
import { Header, BeatList, AddBeatForm, AddBeatButton, AudioPlayer } from './components';
import { handlePlay, handleNext, handlePrev } from './hooks';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

function App() {
  const [refresh, setRefresh] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beats, setBeats] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [hasBeatPlayed, setHasBeatPlayed] = useState(false);
  const [lastPlayedIndex, setLastPlayedIndex] = useState(null);
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

  const handleAdd = () => setRefresh(!refresh);

  const handlePlayWrapper = (beat, play, beats) => handlePlay(beat, play, beats, setSelectedBeat, setBeats, currentBeat, setCurrentBeat, setIsPlaying, setHasBeatPlayed);
  const handleNextWrapper = () => handleNext(repeat, shuffle, lastPlayedIndex, beats, currentBeat, setLastPlayedIndex, handlePlayWrapper, setIsPlaying, setRepeat);
  const handlePrevWrapper = () => handlePrev(repeat, beats, currentBeat, handlePlayWrapper);

  return (
    <div className="App">
      <ToastContainer />
      <div className="container" id="main-content">
        <Header />
        <AddBeatForm onAdd={handleAdd} isOpen={isOpen} setIsOpen={setIsOpen} />
        <BeatList key={refresh} onPlay={handlePlayWrapper} selectedBeat={selectedBeat} isPlaying={isPlaying} />
        <div className="buffer"/>
        <AddBeatButton setIsOpen={setIsOpen} />
      </div>
      <AudioPlayer currentBeat={currentBeat} setCurrentBeat={setCurrentBeat} isPlaying={isPlaying} setIsPlaying={setIsPlaying} onNext={handleNextWrapper} onPrev={handlePrevWrapper} volume={volume} setVolume={setVolume} shuffle={shuffle} setShuffle={setShuffle} repeat={repeat} setRepeat={setRepeat} />
    </div>
  );
}

export default App;