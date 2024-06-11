import React, { useState } from 'react';
import Modal from 'react-modal';
import { addTrack } from '../services/trackService';
import { IoIosCloudUpload } from "react-icons/io";
import './AddTrack.scss'

Modal.setAppElement('#root');

const AddTrack = ({ onAdd, isOpen, setIsOpen }) => {
    const [title, setTitle] = useState('');
    const [audio, setAudio] = useState(null);
    const [bpm, setBpm] = useState(0);
    const [genre, setGenre] = useState('');
    const [tierlist, setTierlist] = useState('');
    const [mood, setMood] = useState('');
    const [keywords, setKeywords] = useState('');
    const [fileName, setFileName] = useState('No file chosen');

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

    const handleFileChange = (e) => {
        setAudio(e.target.files[0]);
        setFileName(e.target.files[0].name);
    }

    const modalStyle = {
        overlay: {
            backgroundColor: 'rgba(30, 30, 30, 0.75)'
        },
        content: {
            backgroundColor: '#181818',
            color: 'white', 
            border: 'none',
            borderRadius: '6px',
            maxWidth: '380px',
            margin: 'auto', 
            padding: '20px',
        }
    };

    const h2Style = {
        marginTop: '0',
    };

    return (
        <div>
            <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} style={modalStyle}>
                <h2 style={h2Style}>Add Tracks</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title:</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-group file-input">
                        <label htmlFor="file" className="file-input__label">
                            <IoIosCloudUpload /> Upload File
                        </label>
                        <input type="file" id="file" className="file-input__input" onChange={handleFileChange} required />
                        <span id="file-name" className="file-input__name">{fileName}</span>
                    </div>
                    <div className="form-group">
                        <label>BPM:</label>
                        <input type="number" value={bpm} onChange={(e) => setBpm(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Genre:</label>
                        <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Tierlist:</label>
                        <select value={tierlist} onChange={(e) => setTierlist(e.target.value)} required>
                            <option value="S">S</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Mood:</label>
                        <input type="text" value={mood} onChange={(e) => setMood(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Keywords:</label>
                        <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} required />
                    </div>
                    <div>
                        <button className="modal__button modal__button--add" type="submit">Add Track</button>
                        <button className="modal__button" type="button" onClick={() => setIsOpen(false)}>Cancel</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AddTrack;