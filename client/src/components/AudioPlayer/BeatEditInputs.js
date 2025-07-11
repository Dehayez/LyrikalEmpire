import React, { useState, useCallback, useEffect } from 'react';
import { useData } from '../../contexts';
import { useBeatActions } from '../../hooks';
import { FormInput, SelectInput, SelectableInput } from '../Inputs';
import './BeatEditInputs.scss';

const BeatEditInputs = ({ currentBeat, onUpdateBeat }) => {
  const { genres, moods, keywords, features } = useData();
  const { handleUpdate } = useBeatActions();
  const [title, setTitle] = useState(currentBeat.title || '');
  const [bpm, setBpm] = useState(currentBeat.bpm || '');
  const [tierlist, setTierlist] = useState(currentBeat.tierlist || '');

  // Sync local state with currentBeat prop changes
  useEffect(() => {
    setTitle(currentBeat.title || '');
    setBpm(currentBeat.bpm || '');
    setTierlist(currentBeat.tierlist || '');
  }, [currentBeat.title, currentBeat.bpm, currentBeat.tierlist]);

  const handleInputChange = useCallback((property, value) => {
    onUpdateBeat?.(currentBeat.id, { [property]: value });
  }, [currentBeat.id, onUpdateBeat]);

  const handleTitleChange = useCallback((e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    handleInputChange('title', newTitle);
  }, [handleInputChange]);

  const handleTitleBlur = useCallback((e) => {
    const newTitle = e.target.value;
    handleUpdate(currentBeat.id, 'title', newTitle);
    // Also update the currentBeat state in App.js through the prop
    handleInputChange('title', newTitle);
  }, [currentBeat.id, handleUpdate, handleInputChange]);

  const handleBpmChange = useCallback((e) => {
    const newBpm = e.target.value;
    setBpm(newBpm);
    handleInputChange('bpm', newBpm);
  }, [handleInputChange]);

  const handleBpmBlur = useCallback((e) => {
    const value = e.target.value;
    if (value === '') {
      handleUpdate(currentBeat.id, 'bpm', null);
      handleInputChange('bpm', null);
      return;
    }
    let bpm = parseFloat(value.replace(',', '.'));
    bpm = Math.round(bpm);
    if (isNaN(bpm) || bpm <= 0 || bpm > 240) {
      alert('Please enter a valid BPM (1-240) or leave it empty.');
      e.target.focus();
    } else {
      e.target.value = bpm;
      handleUpdate(currentBeat.id, 'bpm', bpm);
      handleInputChange('bpm', bpm);
    }
  }, [currentBeat.id, handleUpdate, handleInputChange]);

  const handleTierlistChange = useCallback((e) => {
    const newTierlist = e.target.value;
    setTierlist(newTierlist);
    handleInputChange('tierlist', newTierlist);
    handleUpdate(currentBeat.id, 'tierlist', newTierlist);
  }, [handleInputChange, currentBeat.id, handleUpdate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  }, []);

  return (
    <div className="beat-edit-inputs">
      <div className="beat-edit-inputs__form">
        <FormInput 
          label="Title" 
          id={`mobile-title-${currentBeat.id}`}
          name="title" 
          type="text" 
          value={title} 
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleKeyDown}
          spellCheck="false" 
        />

        <SelectInput 
          id={`mobile-tierlist-${currentBeat.id}`}
          name="tierlist"
          placeholder="Tierlist"
          selectedValue={tierlist} 
          onChange={handleTierlistChange} 
          options={[
            { value: '', label: 'No tierlist' },
            { value: 'M', label: 'M' },
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

        <FormInput
          id={`mobile-bpm-${currentBeat.id}`}
          name="bpm"
          label="BPM"
          type="text"
          value={bpm}
          onChange={handleBpmChange}
          onBlur={handleBpmBlur}
          onKeyDown={handleKeyDown}
          spellCheck="false"
        />

        <SelectableInput
          label="Genres"
          associationType="genres"
          items={genres}
          beatId={currentBeat.id}
          mode="edit"
          disableFocus={false}
          beat={currentBeat}
          onUpdate={(updatedItems, type) => {
            if (onUpdateBeat) {
              onUpdateBeat(currentBeat.id, { [type]: updatedItems });
            }
          }}
        />

        <SelectableInput
          label="Moods"
          associationType="moods"
          items={moods}
          beatId={currentBeat.id}
          mode="edit"
          disableFocus={false}
          beat={currentBeat}
          onUpdate={(updatedItems, type) => {
            if (onUpdateBeat) {
              onUpdateBeat(currentBeat.id, { [type]: updatedItems });
            }
          }}
        />

        <SelectableInput
          label="Keywords"
          associationType="keywords"
          items={keywords}
          beatId={currentBeat.id}
          mode="edit"
          disableFocus={false}
          beat={currentBeat}
          onUpdate={(updatedItems, type) => {
            if (onUpdateBeat) {
              onUpdateBeat(currentBeat.id, { [type]: updatedItems });
            }
          }}
        />

        <SelectableInput
          label="Features"
          associationType="features"
          items={features}
          beatId={currentBeat.id}
          mode="edit"
          disableFocus={false}
          beat={currentBeat}
          onUpdate={(updatedItems, type) => {
            if (onUpdateBeat) {
              onUpdateBeat(currentBeat.id, { [type]: updatedItems });
            }
          }}
        />
      </div>
    </div>
  );
};

export default BeatEditInputs; 