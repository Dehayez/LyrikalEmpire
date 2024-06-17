import React, { useState } from 'react';
import Modal from 'react-modal';
import { addBeat } from '../../services/beatService';
import { IoCloudUploadSharp, IoChevronDownSharp } from "react-icons/io5";
import './AddBeat.scss'
import './AddBeatForm.scss';

Modal.setAppElement('#root');

const FormInput = ({ label, type, placeholder, value, onChange, required, min, pattern, maxLength }) => (
    <div className="form-group">
        <label>{label}</label>
        <input className='form-group__input' type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} min={min} pattern={pattern} maxLength={maxLength} />
    </div>
);

const AddBeatForm = ({ onAdd, isOpen, setIsOpen }) => {
    const [title, setTitle] = useState('');
    const [audio, setAudio] = useState(null);
    const [bpm, setBpm] = useState('');
    const [genre, setGenre] = useState('');
    const [tierlist, setTierlist] = useState('');
    const [mood, setMood] = useState('');
    const [keywords, setKeywords] = useState('');
    const [fileName, setFileName] = useState('No file chosen');

    const resetForm = () => {
        setTitle('');
        setAudio(null);
        setBpm('');
        setGenre('');
        setTierlist('');
        setMood('');
        setKeywords('');
        setFileName('No file chosen');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        let bpmValue = null;
    
        // Only parse and validate the BPM if it's not empty
        if (bpm !== '') {
            // Replace comma with dot and parse as float
            bpmValue = parseFloat(bpm.replace(',', '.'));
    
            // Round to nearest integer
            bpmValue = Math.round(bpmValue);
    
            // Validate that the input is a positive number (integer or decimal)
            // and within the range of 20 to 240 BPM
            if (isNaN(bpmValue) || bpmValue <= 0 || bpmValue > 240) {
                alert('Please enter a valid BPM (1-240) or leave it empty.');
                return; // Don't submit the form
            }
        }
    
        let newBeat = { title, bpm: bpmValue, genre, mood, keywords };
        if (tierlist && tierlist !== '') {
            newBeat.tierlist = tierlist;
        }
        await addBeat(newBeat, audio);
        onAdd();
        resetForm();
        setIsOpen(false);
    };

    const handleFileChange = (e) => {
        setAudio(e.target.files[0]);
        setFileName(e.target.files[0].name);
    }

    const handleBpmChange = (event) => {
        const newValue = event.target.value;
        // Regular expression to allow only numbers, point, and comma
        if (/^[\d.,]*$/.test(newValue) && newValue.length <= 11) {
            setBpm(newValue);
        }
    };
    

    const modalStyle = {
        overlay: {
            backgroundColor: 'rgba(30, 30, 30, 0.75)',
            zIndex: 1,
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
                    <FormInput label="Title" type="text" placeholder='Enter title' value={title} onChange={(e) => setTitle(e.target.value)} required spellCheck="false" />
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
                    <FormInput 
                        label="BPM" 
                        type="text" 
                        placeholder='Enter BPM' 
                        value={bpm} 
                        onChange={handleBpmChange} 
                        onKeyDown={(e) => {
                            // Allow only numbers, decimal point, comma, Backspace, Tab, and arrow keys
                            if (!/^[\d.,]+$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                e.preventDefault();
                            }
                            if (e.key === "Enter") {
                                e.target.blur();
                            }
                        }} 
                        onBlur={(e) => {
                            // If the input is empty, allow it to be null
                            if (e.target.value === '') {
                                setBpm(null);
                                return;
                            }
                        
                            // Replace comma with dot and parse as float
                            let bpmValue = parseFloat(e.target.value.replace(',', '.'));
                        
                            // Round to nearest integer
                            bpmValue = Math.round(bpmValue);
                        
                            // Validate that the input is a positive number (integer or decimal)
                            // and within the range of 20 to 240 BPM
                            if (isNaN(bpmValue) || bpmValue <= 0 || bpmValue > 240) {
                                alert('Please enter a valid BPM (1-240) or leave it empty.');
                                e.target.focus();
                            } else {
                                // Update the input field with the rounded BPM value
                                e.target.value = bpmValue;
                        
                                setBpm(bpmValue);
                            }
                        }}
                        spellCheck="false" 
                    />
                    <FormInput label="Genre" type="text" placeholder='Enter genre' value={genre} onChange={(e) => setGenre(e.target.value)} spellCheck="false" />
                    <div className="form-group">
                        <label>Tierlist</label>
                        <div className="select-wrapper">
                        <select 
                            className="select-wrapper__select" 
                            value={tierlist} 
                            onChange={(e) => setTierlist(e.target.value)}
                            onFocus={(e) => e.target.style.color = 'white'}
                            onBlur={(e) => e.target.style.color = tierlist ? 'white' : 'grey'}
                            style={{color: tierlist ? 'white' : 'grey'}}
                        >
                                <option value="">Select tier</option>
                                <option value="G">G</option>
                                <option value="S">S</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                            </select>
                            <IoChevronDownSharp style={{ position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)' }} />
                        </div>
                    </div>
                    <FormInput label="Mood" type="text" placeholder='Enter mood' value={mood} onChange={(e) => setMood(e.target.value)} spellCheck="false" />
                    <FormInput label="Keywords" type="text" placeholder='Enter keywords' value={keywords} onChange={(e) => setKeywords(e.target.value)} spellCheck="false" />
                    <div>
                        <button className="modal__button modal__button--add" type="submit">Add Beat</button>
                        <button className="modal__button" type="button" onClick={() => {setIsOpen(false); resetForm();}}>Cancel</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AddBeatForm;