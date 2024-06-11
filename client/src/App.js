import React, { useState, useEffect } from 'react';
import TrackList from './components/TrackList';
import AddTrack from './components/AddTrack';
import Header from './components/Header';
import AudioPlayer from './components/AudioPlayer';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
};

function App() {
  const [refresh, setRefresh] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [audioPlayerHeight, setAudioPlayerHeight] = useState(0);


  const handleAdd = () => {
    setRefresh(!refresh);
  };

  const handlePlay = (track, play, tracks) => {
    setSelectedTrack(track);
    setTracks(tracks);
    if (track === null) {
      setCurrentTrack(null);
      setIsPlaying(false);
    } else if (currentTrack && currentTrack.id === track.id) {
      setIsPlaying(play);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handlePlay(tracks[nextIndex], true, tracks);
  };

  const handlePrev = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    handlePlay(tracks[prevIndex], true, tracks);
  };

  useEffect(() => {
    const audioPlayer = document.getElementById('audio-player');
    const mainContent = document.getElementById('main-content');
    if (audioPlayer && mainContent) {
      const audioPlayerHeight = audioPlayer.offsetHeight;
      mainContent.style.paddingBottom = `${audioPlayerHeight}px`;
      setAudioPlayerHeight(audioPlayerHeight);
    }
  }, [currentTrack]);

  return (
    <div className="App">
      <div id="main-content" style={styles.container}>
        <Header />
        <h1>Lyrikal Empire</h1>
        <AddTrack onAdd={handleAdd} isOpen={isOpen} setIsOpen={setIsOpen} />
        <TrackList key={refresh} onPlay={handlePlay} selectedTrack={selectedTrack} isPlaying={isPlaying} />
        <button style={{position: 'fixed', bottom: `${audioPlayerHeight + 20}px`, right: '20px'}} onClick={() => setIsOpen(true)}>Add Track</button>
      </div>
      <div id="audio-player" style={{
        display: 'flex', 
        alignItems: 'center', 
        position: 'fixed', 
        bottom: currentTrack ? 0 : '-100%',
        width: '100%',
        transition: 'bottom 0.4s cubic-bezier(0.1, 0.7, 1.0, 1.0)', 
        padding: '0 20px',
        boxSizing: 'border-box',
        backgroundColor: '#181818',
      }}>
        <div style={{ flex: '1' }}>
          {currentTrack && <div>{currentTrack.title}</div>}
        </div>
        <div style={{ flex: '2' }}>
          {currentTrack && <AudioPlayer currentTrack={currentTrack} isPlaying={isPlaying} setIsPlaying={setIsPlaying} onNext={handleNext} onPrev={handlePrev} />}
        </div>
        <div style={{ flex: '1' }}></div>
      </div>
    </div>
  );
}

export default App;