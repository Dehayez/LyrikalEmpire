import React, { useState } from 'react';
import TrackList from './components/TrackList';
import AddTrack from './components/AddTrack';

function App() {
    const [refresh, setRefresh] = useState(false);

    const handleAdd = () => {
        setRefresh(!refresh);
    };

    return (
        <div className="App">
            <h1>Music Library</h1>
            <AddTrack onAdd={handleAdd} />
            <TrackList key={refresh} />
        </div>
    );
}

export default App;