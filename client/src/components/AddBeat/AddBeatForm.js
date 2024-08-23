import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import Draggable from 'react-draggable';
import { IoCheckmarkSharp } from "react-icons/io5";
import { toast } from 'react-toastify';

import { useData, useBeat } from '../../contexts';
import { useBpmHandlers } from '../../hooks';
import { addBeat } from '../../services';
import { FileInput, FormInput, SelectableInput, SelectInput } from '../Inputs';
import { Warning } from '../Warning';
import { Button } from '../Buttons';

import './AddBeatForm.scss';

Modal.setAppElement('#root');

const AddBeatForm = ({ isOpen, setIsOpen }) => {
    const { setRefreshBeats } = useBeat();
    const { genres, moods, keywords, features } = useData();
    
    const draggableRef = useRef(null);
    const labelRef = useRef(null);
    
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
    const [beatId, setBeatId] = useState(null);
    const { bpm, handleBpmChange: originalHandleBpmChange, handleOnKeyDown, handleBpmBlur, resetBpm } = useBpmHandlers(setBpm);


    const resetForm = () => {
        setTitle('');
        setAudio(null);
        resetBpm();
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
    
        try {
            const beatData = {
                title,
                bpm: bpmValue,
                tierlist,
                duration,
                genres,
                moods,
                keywords,
                features,
                audio
            };

            const addedBeat = await addBeat(beatData);
            const beatId = addedBeat.insertId;
            setBeatId(beatId)
    
            setRefreshBeats(prev => !prev);
    
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
            console.error('An error occurred while uploading the track.', error);
            setWarningMessage('An error occurred while uploading the track.');
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
            overlay: { backgroundColor: 'rgba(30, 30, 30, 0.75)', zIndex: 5 },
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
                            id="title" 
                            name="title" 
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
                        <SelectableInput label="Genre" placeholder="Enter genre" associationType="genres" items={genres} newBeatId={beatId} isNewBeat={true}/>
                        <FormInput
                            id="bpm"
                            name="bpm"
                            label="BPM"
                            type="text"
                            placeholder="Enter BPM"
                            value={bpm}
                            onChange={handleBpmChangeExtended}
                            onKeyDown={handleOnKeyDown}
                            onBlur={handleBpmBlur}
                            spellCheck="false"
                            isWarning={isBpmInvalid}
                        />
                        <SelectInput 
                            id="tierlist"
                            name="tierlist"
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
                        <SelectableInput label="Moods" placeholder="Enter moods" associationType="moods" items={moods} newBeatId={beatId} isNewBeat={true}/>
                        <SelectableInput label="Keywords" placeholder="Enter keywords" associationType="keywords" items={keywords} newBeatId={beatId} isNewBeat={true}/>
                        <SelectableInput label="Features" placeholder="Enter features" associationType="features" items={features} newBeatId={beatId} isNewBeat={true}/>
                        <div className='modal__buttons'>
                            <Button type="transparent" onClick={() => {setIsOpen(false); resetForm();}}>Cancel</Button>
                            <Button type="primary">Add Track</Button>
                        </div>
                    </form>
                </div>
                </div>
            </Draggable>
        </Modal>
    );
};

export default AddBeatForm;