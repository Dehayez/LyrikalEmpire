import React, { useState } from 'react';
import TrackList from './components/TrackList';
import AddTrack from './components/AddTrack';
import Header from './components/Header';
import AudioPlayer from './components/AudioPlayer';

const styles = {
    container: {
      maxWidth: '1200px', // Set a max-width for large screens
      margin: '0 auto', // Center the content on the page
      padding: '0 20px', // Add 20px of padding to the left and right
    },
    // Add more styles as needed
};

function App() {
    const [refresh, setRefresh] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);

    const handleAdd = () => {
        setRefresh(!refresh);
    };

    const handlePlay = (track) => {
        if (currentTrack && currentTrack.id === track.id) {
            setCurrentTrack(null); // pause the current track
        } else {
            setCurrentTrack(track); // play the selected track
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
            <TrackList key={refresh} onPlay={handlePlay} />
        </div>
        <div style={{ 
            display: 'flex', // Always display, but will be offscreen when not playing
            alignItems: 'center', 
            position: 'fixed', 
            bottom: currentTrack ? 0 : '-100%', // Move offscreen when not playing
            width: '100%', 
            backgroundColor: '#fff', // or any color you prefer
            padding: '10px 0',
            transition: 'bottom 0.4s cubic-bezier(0.1, 0.7, 1.0, 1.0)' // Animate the bottom property
        }} className="animated-div">
            <div style={{ flex: '1' }}>
                {currentTrack && <div>{currentTrack.title}</div>}
            </div>
            <div style={{ flex: '2' }}>
                {currentTrack && <AudioPlayer currentTrack={currentTrack} />} {/* Only render when a track is playing */}
            </div>
            <div style={{ flex: '1' }}></div>
        </div>
    </div>
    );
}

export default App;