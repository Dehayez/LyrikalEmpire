import React, { useState } from 'react';
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


  return (
    <div className="App">
      <div style={styles.container}>
        <Header />
      </div>
      <div style={styles.container}>
        <h1>Music Library</h1>
        <AddTrack onAdd={handleAdd} />
        <TrackList key={refresh} onPlay={handlePlay} selectedTrack={selectedTrack} isPlaying={isPlaying} />
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        position: 'fixed',
        bottom: currentTrack ? 0 : '-100%',
        width: '100%',
        backgroundColor: '#fff',
        padding: '10px 0',
        transition: 'bottom 0.4s cubic-bezier(0.1, 0.7, 1.0, 1.0)'
      }} className="animated-div">
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