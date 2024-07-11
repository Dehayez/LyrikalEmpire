import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import Draggable from 'react-draggable';
import { addBeat, getGenres, getMoods, getKeywords } from '../../services';
import { useBpmHandlers, useSelectableList } from '../../hooks';
import { FileInput, FormInput, SelectableInput, SelectInput } from '../Inputs';
import { IoCheckmarkSharp } from "react-icons/io5";
import { toast } from 'react-toastify';
import './AddBeatForm.scss';

Modal.setAppElement('#root');

const AddBeatForm = ({ onAdd, isOpen, setIsOpen }) => {
    const [title, setTitle] = useState('');
    const [audio, setAudio] = useState(null);
    const [bpmState, setBpm] = useState('');
    const [tierlist, setTierlist] = useState('');
    const [fileName, setFileName] = useState('No file chosen');
    const [showToast, setShowToast] = useState(false);
    const { bpm, handleBpmChange, handleOnKeyDown, handleBpmBlur, resetBpm } = useBpmHandlers(setBpm);

    const draggableRef = useRef(null);

    const resetForm = () => {
        setTitle('');
        setAudio(null);
        resetBpm();
        handleGenreChange({ target: { value: '' } });
        handleMoodChange({ target: { value: '' } });
        handleKeywordChange({ target: { value: '' } });
        setTierlist('');
        setFileName('No file chosen');
    };

  const { items: genres, selectedItem: genre, filteredItems: filteredGenres, showItems: showGenres, selectedItems: selectedGenres, handleItemChange: handleGenreChange, handleItemToggle: handleGenreToggle, handleItemFocus: handleGenreFocus, handleItemBlur: handleGenreBlur } = useSelectableList(getGenres);
  const { items: keywords, selectedItem: keyword, filteredItems: filteredKeywords, showItems: showKeywords, selectedItems: selectedKeywords, handleItemChange: handleKeywordChange, handleItemToggle: handleKeywordToggle, handleItemFocus: handleKeywordFocus, handleItemBlur: handleKeywordBlur } = useSelectableList(getKeywords);
  const { items: moods, selectedItem: mood, filteredItems: filteredMoods, showItems: showMoods, selectedItems: selectedMoods, handleItemChange: handleMoodChange, handleItemToggle: handleMoodToggle, handleItemFocus: handleMoodFocus, handleItemBlur: handleMoodBlur } = useSelectableList(getMoods);

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
    
        let newBeat = { title, bpm: bpmValue, genre, mood, keyword };
        if (tierlist && tierlist !== '') {
            newBeat.tierlist = tierlist;
        }
        try {
            const response = await addBeat(newBeat, audio);
            const addedBeat = { ...newBeat, id: response.id };
            onAdd(addedBeat);
            resetForm();
            setIsOpen(false);
            setShowToast(true);
            toast.dark(<div><strong>{title}</strong> added successfully!</div>, {
                autoClose: 3000,
                pauseOnFocusLoss: false,
                icon: <IoCheckmarkSharp size={24} />,
                className: "Toastify__toast--success",
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

    useEffect(() => {
        const handleKeyDown = (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit(event);
          }
        };
      
        if (isOpen) {
          document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      }, [isOpen, handleSubmit]);

    return (
        <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} style={modalStyle}>
            <Draggable handle=".form__title" nodeRef={draggableRef}>
                <div ref={draggableRef}>
                <div className="modal-content">
                    <h2 className='form__title'>Add Beat</h2>
                    <form className='form' onSubmit={handleSubmit}>
                        <FileInput fileName={fileName} onChange={handleFileChange} />
                        <FormInput label="Title" type="text" placeholder='Enter title' value={title} onChange={(e) => setTitle(e.target.value)} required spellCheck="false" />
                        <FormInput label="BPM" type="text" placeholder='Enter BPM' value={bpm} onChange={handleBpmChange} onKeyDown={handleOnKeyDown} onBlur={handleBpmBlur}spellCheck="false"/>
                        <SelectableInput label="Genre" placeholder="Enter genre" value={genre} onChange={handleGenreChange} onFocus={handleGenreFocus} onBlur={handleGenreBlur} showItems={showGenres} filteredItems={filteredGenres.map(genre => ({ name: genre.name, selected: selectedGenres.includes(genre.name) }))} handleItemToggle={handleGenreToggle}/>
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
                        <SelectableInput label="Moods" placeholder="Enter moods" value={mood} onChange={handleMoodChange} onFocus={handleMoodFocus} onBlur={handleMoodBlur} showItems={showMoods} filteredItems={filteredMoods.map(mood => ({ name: mood.name, selected: selectedMoods.includes(mood.name) }))} handleItemToggle={handleMoodToggle}/>
                        <SelectableInput label="Keywords" placeholder="Enter keywords" value={keyword} onChange={handleKeywordChange} onFocus={handleKeywordFocus} onBlur={handleKeywordBlur} showItems={showKeywords} filteredItems={filteredKeywords.map(keyword => ({ name: keyword.name, selected: selectedKeywords.includes(keyword.name) }))} handleItemToggle={handleKeywordToggle}/>
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