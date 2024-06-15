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
  const [hasBeatPlayed, setHasBeatPlayed] = useState(false);

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
      setHasBeatPlayed(true); // Set this to true when a beat is played
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
    if (audioPlayer && mainContent && hasBeatPlayed) {
      const audioPlayerHeight = audioPlayer.offsetHeight;
      mainContent.style.paddingBottom = `${audioPlayerHeight}px`;
      setAudioPlayerHeight(audioPlayerHeight);
      setAddBeatButtonBottom(audioPlayerHeight + 20);
    }
  }, [currentBeat, hasBeatPlayed]); 

  return (
    <div className="App">
      <div id="main-content" style={styles.container}>
        <Header />
        <AddBeatForm onAdd={handleAdd} isOpen={isOpen} setIsOpen={setIsOpen} />
        <BeatList key={refresh} onPlay={handlePlay} selectedBeat={selectedBeat} isPlaying={isPlaying} />
        <AddBeatButton setIsOpen={setIsOpen} addBeatButtonBottom={addBeatButtonBottom} animateAddButton={animateAddButton} setAnimateAddButton={setAnimateAddButton} />
      </div>
      <AudioPlayer currentBeat={currentBeat} isPlaying={isPlaying} setIsPlaying={setIsPlaying} onNext={handleNext} onPrev={handlePrev} volume={volume} setVolume={setVolume} />
    </div>
  );
}

export default App;