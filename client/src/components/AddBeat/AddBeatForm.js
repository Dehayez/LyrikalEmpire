import React, { useState, useRef, useEffect } from 'react';
import { IoCheckmarkSharp } from "react-icons/io5";
import { toast } from 'react-toastify';

import { useData, useBeat, useUser } from '../../contexts';
import { useBpmHandlers, useBeatActions} from '../../hooks';
import { addBeat } from '../../services';

import DraggableModal from '../Modals/DraggableModal';
import { FileInput, FormInput, SelectableInput, SelectInput } from '../Inputs';
import { Warning } from '../Warning';

import './AddBeatForm.scss';

const AddBeatForm = ({ isOpen, setIsOpen }) => {
    const { setRefreshBeats } = useBeat();
    const { user } = useUser();
    const { genres, moods, keywords, features } = useData();
    
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
    
            console.log('Starting upload...');
            const startTime = Date.now();
    
            const addedBeat = await addBeat(beatData, audio, user.id, (percentage) => {
                const elapsedTime = Date.now() - startTime;
                console.log(`Upload progress: ${percentage}% (Elapsed time: ${elapsedTime}ms)`);
            });
    
            const beatId = addedBeat.insertId;
            setBeatId(beatId);
    
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
    
            console.log('Upload complete');
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

    const onClose = () => {
        resetForm();
        setIsOpen(false); 
    };

    const onCloseNoReset = () => {
        setIsOpen(false); 
    };

    useEffect(() => {
        const handleKeyDown = (event) => isOpen && event.key === 'Enter' && handleSubmit(event);
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleSubmit]);

    return (
        <DraggableModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Add Track"
            onConfirm={handleSubmit}
            onCancel={onClose}
            onCloseNoReset={onCloseNoReset}
            confirmButtonText="Add"
            cancelButtonText="Cancel"
        >
                {isTitleEmpty ? (
                    <Warning message="Title is required." />
                ) : warningMessage && (
                    <Warning message={warningMessage} />
                )}
                <form className='form add-beat-form' onSubmit={handleSubmit} noValidate>
                    <FileInput fileName={fileName} onChange={handleFileChange} fileObject={audio} labelRef={labelRef} />
                    <FormInput 
                        label="Title" 
                        id="title" 
                        name="title" 
                        type="text" 
                        value={title} 
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setIsTitleEmpty(!e.target.value.trim());
                        }} 
                        required 
                        spellCheck="false" 
                        isWarning={isTitleEmpty}
                    />
                    <SelectableInput label="Genre" associationType="genres" items={genres} newBeatId={beatId} form/>
                    <FormInput
                        id="bpm"
                        name="bpm"
                        label="BPM"
                        type="text"
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
                        placeholder="Tierlist"
                        selectedValue={tierlist} 
                        onChange={(e) => setTierlist(e.target.value)} 
                        options={[
                            { value: '', label: 'No tierlist' },
                            { value: 'S', label: 'S' },
                            { value: 'A', label: 'A' },
                            { value: 'B', label: 'B' },
                            { value: 'C', label: 'C' },
                            { value: 'D', label: 'D' },
                            { value: 'E', label: 'E' },
                            { value: 'F', label: 'F' },
                        ]}
                    />
                    <SelectableInput label="Moods" associationType="moods" items={moods} newBeatId={beatId} form/>
                    <SelectableInput label="Keywords" associationType="keywords" items={keywords} newBeatId={beatId} form/>
                    <SelectableInput label="Features" associationType="features" items={features} newBeatId={beatId} form/>
                </form>
        </DraggableModal>
    );
};

export default AddBeatForm;