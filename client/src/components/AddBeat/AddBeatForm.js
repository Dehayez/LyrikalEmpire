import React, { useState, useRef } from 'react';
import Modal from 'react-modal';
import Draggable from 'react-draggable';
import { addBeat } from '../../services/beatService';
import { IoCloudUploadSharp, IoChevronDownSharp } from "react-icons/io5";
import { toast } from 'react-toastify';
import { useBpmHandlers } from '../../hooks';
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
    const [bpmState, setBpm] = useState('');
    const [genre, setGenre] = useState('');
    const [tierlist, setTierlist] = useState('');
    const [mood, setMood] = useState('');
    const [keywords, setKeywords] = useState('');
    const [fileName, setFileName] = useState('No file chosen');
    const [showToast, setShowToast] = useState(false);
    const { bpm, handleBpmChange, handleOnKeyDown, handleBpmBlur, resetBpm } = useBpmHandlers(setBpm);

    const draggableRef = useRef(null);

    const resetForm = () => {
        setTitle('');
        setAudio(null);
        resetBpm();
        setGenre('');
        setTierlist('');
        setMood('');
        setKeywords('');
        setFileName('No file chosen');
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        let bpmValue = null;
    
        if (bpm !== '') {
            bpmValue = parseFloat(bpm.replace(',', '.'));
            bpmValue = Math.round(bpmValue);
    
            if (isNaN(bpmValue) || bpmValue <= 0 || bpmValue > 240) {
                alert('Please enter a valid BPM (1-240) or leave it empty.');
                return; 
            }
        }
    
        let newBeat = { title, bpm: bpmValue, genre, mood, keywords };
        if (tierlist && tierlist !== '') {
            newBeat.tierlist = tierlist;
        }
        try {
            await addBeat(newBeat, audio);
            onAdd();
            resetForm();
            setIsOpen(false);
            setShowToast(true);
            toast.dark(<div><strong>{title}</strong> added successfully!</div>, {
                autoClose: 3000,
                pauseOnFocusLoss: false
            });
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('An error occurred while uploading the beat.');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setAudio(file);
        setFileName(file.name);
    
        const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        setTitle(fileNameWithoutExtension);
    };

    const modalStyle = {
        overlay: {
            backgroundColor: 'rgba(30, 30, 30, 0.75)',
            zIndex: 3,
        },
        content: {
            backgroundColor: 'transparent',
            color: 'white', 
            border: 'none',
            height: '100%',
            width: '100%',
            margin: 'auto', 
            position: 'absolute',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)'
        }
    };

    return (
<Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} style={modalStyle}>
    <Draggable handle=".form__title" nodeRef={draggableRef}>
        <div ref={draggableRef}>
        <div className="modal-content">
            <h2 className='form__title'>Add Beat</h2>
            <form className='form' onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Audio</label>
                    <div className="file-input">
                        <div className="file-input__wrapper">
                            <label htmlFor="file" className="file-input__label no-margin">
                                <IoCloudUploadSharp /> Upload File
                            </label>
                            <input type="file" id="file" className="file-input__input" onChange={handleFileChange} required accept="audio/*" />
                            <span id="file-name" className="file-input__name">{fileName}</span>
                        </div>
                    </div>
                </div>
                <FormInput label="Title" type="text" placeholder='Enter title' value={title} onChange={(e) => setTitle(e.target.value)} required spellCheck="false" />
                <FormInput 
                    label="BPM" 
                    type="text" 
                    placeholder='Enter BPM' 
                    value={bpm} 
                    onChange={handleBpmChange} 
                    onKeyDown={handleOnKeyDown} 
                    onBlur={handleBpmBlur}
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
                <div className='modal__buttons'>
                    <button className="modal__button modal__button--add" type="submit">Add Beat</button>
                    <button className="modal__button" type="button" onClick={() => {setIsOpen(false); resetForm();}}>Cancel</button>
                </div>
            </form>
        </div>
        </div>
    </Draggable>
</Modal>
    );
};

export default AddBeatForm;