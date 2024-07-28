import React, { useState, useRef, useEffect } from 'react';
import './AddBeatForm.scss';
import { IoAlertCircleOutline, IoCheckmarkSharp } from "react-icons/io5";
import Modal from 'react-modal';
import Draggable from 'react-draggable';
import { toast } from 'react-toastify';
import { addBeat, getGenres, getMoods, getKeywords } from '../../services';
import { useBpmHandlers, useSelectableList } from '../../hooks';
import { FileInput, FormInput, SelectableInput, SelectInput } from '../Inputs';
import { Warning } from '../Warning';

Modal.setAppElement('#root');

const AddBeatForm = ({ onAdd, isOpen, setIsOpen }) => {
    const [title, setTitle] = useState('');
    const [audio, setAudio] = useState(null);
    const [duration, setDuration] = useState(0);
    const [bpmState, setBpm] = useState('');
    const [tierlist, setTierlist] = useState('');
    const [fileName, setFileName] = useState('No file chosen');
    const [warningMessage, setWarningMessage] = useState('');
    const [isTitleEmpty, setIsTitleEmpty] = useState(false);
    const [isBpmInvalid, setIsBpmInvalid] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const { bpm, handleBpmChange: originalHandleBpmChange, handleOnKeyDown, handleBpmBlur, resetBpm } = useBpmHandlers(setBpm);

    const draggableRef = useRef(null);
    const labelRef = useRef(null);

    const { items: genres, selectedItem: genre, filteredItems: filteredGenres, showItems: showGenres, selectedItems: selectedGenres, handleItemChange: handleGenreChange, handleItemToggle: handleGenreToggle, handleItemFocus: handleGenreFocus, handleItemBlur: handleGenreBlur } = useSelectableList(getGenres);
    const { items: keywords, selectedItem: keyword, filteredItems: filteredKeywords, showItems: showKeywords, selectedItems: selectedKeywords, handleItemChange: handleKeywordChange, handleItemToggle: handleKeywordToggle, handleItemFocus: handleKeywordFocus, handleItemBlur: handleKeywordBlur } = useSelectableList(getKeywords);
    const { items: moods, selectedItem: mood, filteredItems: filteredMoods, showItems: showMoods, selectedItems: selectedMoods, handleItemChange: handleMoodChange, handleItemToggle: handleMoodToggle, handleItemFocus: handleMoodFocus, handleItemBlur: handleMoodBlur } = useSelectableList(getMoods);

    const resetForm = () => {
        setTitle('');
        setAudio(null);
        resetBpm();
        handleGenreChange({ target: { value: '' } });
        handleMoodChange({ target: { value: '' } });
        handleKeywordChange({ target: { value: '' } });
        setTierlist('');
        setFileName('No file chosen');
        setWarningMessage(''); 
        setIsTitleEmpty(false); 
        setIsBpmInvalid(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!audio) {
            setWarningMessage('Audio file is required.');
            return;
        }
    
        const bpmValue = bpm ? Math.round(parseFloat(bpm.replace(',', '.'))) : null;
    
        setIsTitleEmpty(!title.trim());
        setIsBpmInvalid(bpm && (isNaN(bpmValue) || bpmValue <= 0 || bpmValue > 240));
    
        if (!title.trim()) {
            setWarningMessage('Title is required.');
            return;
        }
    
        if (bpm && (isNaN(bpmValue) || bpmValue <= 0 || bpmValue > 240)) {
            setWarningMessage('Please enter a valid BPM (1-240).');
            return;
        } else if (bpm) {
            setWarningMessage('');
        }
    
        const newBeat = { title, bpm: bpmValue, genre, mood, keyword, duration, ...(tierlist && { tierlist }) };
        try {
            const { id } = await addBeat(newBeat, audio);
            onAdd({ ...newBeat, id });
            resetForm();
            setIsOpen(false);
            toast.dark(<div><strong>{title}</strong> has been added!</div>, {
                autoClose: 3000,
                pauseOnFocusLoss: false,
                icon: <IoCheckmarkSharp size={24} />,
                className: "Toastify__toast--success",
            });
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('An error occurred while uploading the track.');
        }
    };

    const handleFileChange = e => {
        const file = e.target.files[0];
        setAudio(file);
        setFileName(file.name);
        if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
    
        const audio = new Audio(URL.createObjectURL(file));
        audio.onloadedmetadata = () => {
            setDuration(audio.duration);
            URL.revokeObjectURL(audio.src);
        };
    };

    const handleBpmChangeExtended = (e) => {
        const bpmInput = e.target.value;
        const bpmValue = bpmInput.replace(',', '.');
        const isNumericOrEmpty = bpmInput === '' || !isNaN(bpmValue);
    
        if (isNumericOrEmpty) {
            const isValidBpm = bpmInput && !isNaN(bpmValue) && bpmValue > 0 && bpmValue <= 240;
    
            originalHandleBpmChange(e);
    
            setIsBpmInvalid(bpmInput && !isValidBpm);
    
            if (isValidBpm || !bpmInput) {
                setWarningMessage('');
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => isOpen && event.key === 'Enter' && handleSubmit(event);
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleSubmit]);

    return (
        <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} style={{
            overlay: { backgroundColor: 'rgba(30, 30, 30, 0.75)', zIndex: 3 },
            content: { backgroundColor: 'transparent', color: 'white', border: 'none', height: '100%', width: '100%', margin: 'auto', position: 'absolute', top: '50%', left: '50%', right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)' }
        }}>
            <Draggable handle=".form__title" nodeRef={draggableRef}>
                <div ref={draggableRef}>
                <div className="modal-content">
                    <h2 className='form__title'>Add Track</h2>
                    {isTitleEmpty ? (
                        <Warning message="Title is required." />
                    ) : warningMessage && (
                        <Warning message={warningMessage} />
                    )}
                    <form className='form' onSubmit={handleSubmit} noValidate>
                        <FileInput fileName={fileName} onChange={handleFileChange} fileObject={audio} labelRef={labelRef} />
                        <FormInput 
                            label="Title" 
                            type="text" 
                            placeholder='Enter title' 
                            value={title} 
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setIsTitleEmpty(!e.target.value.trim());
                            }} 
                            required 
                            spellCheck="false" 
                            isWarning={isTitleEmpty}
                        />
                        <FormInput label="BPM" type="text" placeholder='Enter BPM' value={bpm} onChange={handleBpmChangeExtended} onKeyDown={handleOnKeyDown} onBlur={handleBpmBlur} spellCheck="false" isWarning={isBpmInvalid} />
                        <SelectableInput label="Genre" placeholder="Enter genre" itemType="genres" value={genre} onChange={handleGenreChange} onFocus={handleGenreFocus} onBlur={handleGenreBlur} showItems={showGenres} filteredItems={filteredGenres.map(genre => ({ name: genre.name, selected: selectedGenres.includes(genre.name) }))} handleItemToggle={handleGenreToggle}/>
                        <SelectInput 
                            label="Tierlist"
                            selectedValue={tierlist} 
                            onChange={(e) => setTierlist(e.target.value)} 
                            options={[
                                { value: 'G', label: 'G' },
                                { value: 'S', label: 'S' },
                                { value: 'A', label: 'A' },
                                { value: 'B', label: 'B' },
                                { value: 'C', label: 'C' },
                                { value: 'D', label: 'D' },
                                { value: 'E', label: 'E' },
                                { value: 'F', label: 'F' },
                            ]}
                        />
                        <SelectableInput label="Moods" placeholder="Enter moods" itemType="moods" value={mood} onChange={handleMoodChange} onFocus={handleMoodFocus} onBlur={handleMoodBlur} showItems={showMoods} filteredItems={filteredMoods.map(mood => ({ name: mood.name, selected: selectedMoods.includes(mood.name) }))} handleItemToggle={handleMoodToggle}/>
                        <SelectableInput label="Keywords" placeholder="Enter keywords" itemType="keywords" value={keyword} onChange={handleKeywordChange} onFocus={handleKeywordFocus} onBlur={handleKeywordBlur} showItems={showKeywords} filteredItems={filteredKeywords.map(keyword => ({ name: keyword.name, selected: selectedKeywords.includes(keyword.name) }))} handleItemToggle={handleKeywordToggle}/>
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