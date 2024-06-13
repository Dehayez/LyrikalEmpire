import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import BeatList from './components/BeatList';
import AddBeatForm from './components/AddBeat/AddBeatForm';
import AddBeatButton from './components/AddBeat/AddBeatButton';
import AudioPlayer from './components/AudioPlayer/AudioPlayer';
import { IoAdd } from 'react-icons/io5';
import './App.scss';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
};

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
  const [volume, setVolume] = useState(1.0); // Volume is between 0.0 and 1.0

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
    }
  };
  const handleNext = () => {
    const currentIndex = beats.findIndex(beat => beat.id === currentBeat.id);
    const nextIndex = (currentIndex + 1) % beats.length;
    handlePlay(beats[nextIndex], true, beats);
  };
  const handlePrev = () => {
    const currentIndex = beats.findIndex(beat => beat.id === currentBeat.id);
    const prevIndex = (currentIndex - 1 + beats.length) % beats.length;
    handlePlay(beats[prevIndex], true, beats);
  };

  useEffect(() => {
    const audioPlayer = document.getElementById('audio-player');
    const mainContent = document.getElementById('main-content');
    if (audioPlayer && mainContent) {
      const audioPlayerHeight = audioPlayer.offsetHeight;
      mainContent.style.paddingBottom = `${audioPlayerHeight}px`;
      setAudioPlayerHeight(audioPlayerHeight);
      setAddBeatButtonBottom(audioPlayerHeight + 20);
    }
  }, [currentBeat]);

  return (
    <div className="App">
      <div id="main-content" style={styles.container}>
        <Header />
        <AddBeatForm onAdd={handleAdd} isOpen={isOpen} setIsOpen={setIsOpen} />
        <BeatList key={refresh} onPlay={handlePlay} selectedBeat={selectedBeat} isPlaying={isPlaying} />
        <AddBeatButton setIsOpen={setIsOpen} addBeatButtonBottom={addBeatButtonBottom} animateAddButton={animateAddButton} setAnimateAddButton={setAnimateAddButton} />
        <button 
          style={{
            position: 'fixed', 
            bottom: `${addBeatButtonBottom}px`, 
            right: '20px', 
            transition: 'bottom 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) 0.1s',
            backgroundColor: '#505050',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
          }} 
          onClick={() => setIsOpen(true)}
          className={`icon-button ${animateAddButton ? 'animate-scale' : ''}`} 
          onMouseDown={() => setAnimateAddButton(true)}
          onMouseUp={() => setAnimateAddButton(false)}
          onMouseLeave={() => setAnimateAddButton(false)}
        >
          <span className="tooltip tooltip__addbeat">Add Beat</span>
          <IoAdd />
        </button>
      </div>
      <AudioPlayer currentBeat={currentBeat} isPlaying={isPlaying} setIsPlaying={setIsPlaying} onNext={handleNext} onPrev={handlePrev} volume={volume} setVolume={setVolume} />
    </div>
  );
}

export default App;