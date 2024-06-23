import React, { useState, useEffect } from 'react';
import { getBeats } from './services';
import { Header, BeatList, AddBeatForm, AddBeatButton, AudioPlayer, Queue } from './components';
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
  const [queue, setQueue] = useState([]); // State to hold the queue

  const [currentBeat, setCurrentBeat] = useState(() => {
    const savedCurrentBeat = localStorage.getItem('currentBeat');
    return savedCurrentBeat !== null && savedCurrentBeat !== "undefined" ? JSON.parse(savedCurrentBeat) : null;
  });
  const [selectedBeat, setSelectedBeat] = useState(() => {
    const savedBeat = localStorage.getItem('selectedBeat');
    return savedBeat !== null && savedBeat !== "undefined" ? JSON.parse(savedBeat) : null;
  });
  const [shuffle, setShuffle] = useState(() => {
    const savedShuffle = localStorage.getItem('shuffle');
    return savedShuffle !== null && savedShuffle !== "undefined" ? JSON.parse(savedShuffle) : false;
  });
  const [repeat, setRepeat] = useState(() => {
    const savedRepeat = localStorage.getItem('repeat');
    return savedRepeat !== null && savedRepeat !== "undefined" ? savedRepeat : 'Disabled Repeat';
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
    // Update the queue state whenever beats, shuffle, or currentBeat changes
    logQueue(beats, shuffle, currentBeat); // This function now updates the queue state
  }, [beats, shuffle, currentBeat]);

  function logQueue(beats, shuffle, currentBeat) {
    let queue = [...beats];
  
    if (shuffle) {
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
    }
  
    const currentBeatIndex = queue.findIndex(beat => beat.id === currentBeat.id);
  
    if (currentBeatIndex > 0) {
      const currentAndNext = queue.splice(currentBeatIndex);
      queue = [...currentAndNext, ...queue];
    }
  
    setQueue(queue); // Update the queue state
  }

  const handleAdd = () => setRefresh(!refresh);

  const handlePlayWrapper = (beat, play, beats) => handlePlay(beat, play, beats, setSelectedBeat, setBeats, currentBeat, setCurrentBeat, setIsPlaying, setHasBeatPlayed);
  const handleNextWrapper = () => handleNext(repeat, shuffle, lastPlayedIndex, beats, currentBeat, setLastPlayedIndex, handlePlayWrapper, setIsPlaying, setRepeat);
  const handlePrevWrapper = () => handlePrev(repeat, beats, currentBeat, handlePlayWrapper);

  const [isSidePanelInContent, setIsSidePanelInContent] = useState(false);
  const toggleSidePanel = () => {
    setIsSidePanelInContent(!isSidePanelInContent);
  };

  return (
    <div className="App">
      <ToastContainer />
      <div className="container" id="main-content">
        <Header isSidePanelInContent={isSidePanelInContent} toggleSidePanel={toggleSidePanel} />
        <AddBeatForm onAdd={handleAdd} isOpen={isOpen} setIsOpen={setIsOpen} />
        <BeatList key={refresh} onPlay={handlePlayWrapper} selectedBeat={selectedBeat} isPlaying={isPlaying} />
        <Queue queue={queue} /> {/* Render the Queue component */}
        <div className="buffer"/>
        <AddBeatButton setIsOpen={setIsOpen} />
      </div>
      <AudioPlayer currentBeat={currentBeat} setCurrentBeat={setCurrentBeat} isPlaying={isPlaying} setIsPlaying={setIsPlaying} onNext={handleNextWrapper} onPrev={handlePrevWrapper} volume={volume} setVolume={setVolume} shuffle={shuffle} setShuffle={setShuffle} repeat={repeat} setRepeat={setRepeat} />
    </div>
  );
}

export default App;