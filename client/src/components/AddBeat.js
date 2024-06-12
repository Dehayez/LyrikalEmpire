import React, { useState } from 'react';
import Modal from 'react-modal';
import { addBeat } from '../services/beatService';
import { IoCloudUploadSharp, IoChevronDownSharp } from "react-icons/io5";
import './AddBeat.scss'

Modal.setAppElement('#root');

const FormInput = ({ label, type, placeholder, value, onChange, required, min, pattern, maxLength }) => (
    <div className="form-group">
        <label>{label}</label>
        <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} min={min} pattern={pattern} maxLength={maxLength} />
    </div>
);

const AddBeat = ({ onAdd, isOpen, setIsOpen }) => {
    const [title, setTitle] = useState('');
    const [audio, setAudio] = useState(null);
    const [bpm, setBpm] = useState('');
    const [genre, setGenre] = useState('');
    const [tierlist, setTierlist] = useState('');
    const [mood, setMood] = useState('');
    const [keywords, setKeywords] = useState('');
    const [fileName, setFileName] = useState('No file chosen');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newBeat = { title, bpm, genre, tierlist, mood, keywords };
        await addBeat(newBeat, audio);
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

    const handleBpmChange = (value) => {
        if (String(value).length <= 3) {
            setBpm(value);
        }
    };

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

    return (
        <div>
            <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} style={modalStyle}>
                <h2 style={{marginTop: '0'}}>Add Beat</h2>
                <form onSubmit={handleSubmit}>
                    <FormInput label="Title" type="text" placeholder='Enter title' value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <div className="form-group">
                        <label>Audio</label>
                        <div className="file-input">
                            <div className="file-input__wrapper">
                                <label htmlFor="file" className="file-input__label no-margin">
                                    <IoCloudUploadSharp /> Upload File
                                </label>
                                <input type="file" id="file" className="file-input__input" onChange={handleFileChange} required />
                                <span id="file-name" className="file-input__name">{fileName}</span>
                            </div>
                        </div>
                    </div>
                    <FormInput label="BPM" type="number" placeholder='Enter BPM' value={bpm} onChange={(e) => handleBpmChange(e.target.value)} required min="0" pattern="\d+" maxLength="3" />
                    <FormInput label="Genre" type="text" placeholder='Enter genre' value={genre} onChange={(e) => setGenre(e.target.value)} required />
                    <div className="form-group">
                        <label>Tierlist</label>
                        <div className="select-wrapper">
                            <select value={tierlist} onChange={(e) => setTierlist(e.target.value)} required>
                                <option value="S">S</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                            <IoChevronDownSharp style={{ position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)' }} />
                        </div>
                    </div>
                    <FormInput label="Mood" type="text" placeholder='Enter mood' value={mood} onChange={(e) => setMood(e.target.value)} required />
                    <FormInput label="Keywords" type="text" placeholder='Enter keywords' value={keywords} onChange={(e) => setKeywords(e.target.value)} required />
                    <div>
                        <button className="modal__button modal__button--add" type="submit">Add Beat</button>
                        <button className="modal__button" type="button" onClick={() => setIsOpen(false)}>Cancel</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AddBeat;