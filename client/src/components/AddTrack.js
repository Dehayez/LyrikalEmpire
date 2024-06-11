import React, { useState } from 'react';
import { addTrack } from '../services/trackService';

const AddTrack = ({ onAdd, isOpen, setIsOpen }) => {
    const [title, setTitle] = useState('');
    const [audio, setAudio] = useState(null);
    const [bpm, setBpm] = useState(0);
    const [genre, setGenre] = useState('');
    const [tierlist, setTierlist] = useState('');
    const [mood, setMood] = useState('');
    const [keywords, setKeywords] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newTrack = { title, bpm, genre, tierlist, mood, keywords };
        await addTrack(newTrack, audio);
        onAdd();
        setTitle('');
        setAudio(null);
        setBpm(0);
        setGenre('');
        setTierlist('');
        setMood('');
        setKeywords('');
        setIsOpen(false);
    };

    return (
        <div>
            {isOpen && (
                <div style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px'}}>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Title:</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div>
                            <label>Audio:</label>
                            <input type="file" onChange={(e) => setAudio(e.target.files[0])} required />
                        </div>
                        <div>
                            <label>BPM:</label>
                            <input type="number" value={bpm} onChange={(e) => setBpm(e.target.value)} required />
                        </div>
                        <div>
                            <label>Genre:</label>
                            <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} required />
                        </div>
                        <div>
                            <label>Tierlist:</label>
                            <select value={tierlist} onChange={(e) => setTierlist(e.target.value)} required>
                                <option value="S">S</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                        <div>
                            <label>Mood:</label>
                            <input type="text" value={mood} onChange={(e) => setMood(e.target.value)} required />
                        </div>
                        <div>
                            <label>Keywords:</label>
                            <textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} required />
                        </div>
                        <button type="submit">Add Track</button>
                        <button type="button" onClick={() => setIsOpen(false)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AddTrack;