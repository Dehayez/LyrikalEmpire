import React, { useState } from 'react';
import { handlePlay, handleNext, handlePrev, useLocalStorageAndFetch } from './hooks';
import { Header, BeatList, AddBeatForm, AddBeatButton, AudioPlayer } from './components';
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

  const {
    currentBeat, setCurrentBeat,
    selectedBeat, setSelectedBeat,
    shuffle, setShuffle,
    repeat, setRepeat
  } = useLocalStorageAndFetch();

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