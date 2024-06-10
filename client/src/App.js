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
  const [paused, setPaused] = useState(false);
  const [playingTrack, setPlayingTrack] = useState(null);

  const handleAdd = () => {
    setRefresh(!refresh);
  };

  const handlePlay = (track) => {
    if (track === null) {
      setCurrentTrack(null);
      setPaused(false);
    } else if (currentTrack && currentTrack.id === track.id) {
      setPaused(!paused);
    } else {
      setCurrentTrack(track);
      setPaused(false);
    }
  };

  return (
    <div className="App">
      <div style={styles.container}>
        <Header />
      </div>
      <div style={styles.container}>
        <h1>Music Library</h1>
        <AddTrack onAdd={handleAdd} />
        <TrackList key={refresh} onPlay={handlePlay} setPlayingTrack={setPlayingTrack} /> {/* Pass setPlayingTrack */}
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
          {currentTrack && <AudioPlayer currentTrack={currentTrack} paused={paused} />}
        </div>
        <div style={{ flex: '1' }}></div>
      </div>
    </div>
  );
}

export default App;