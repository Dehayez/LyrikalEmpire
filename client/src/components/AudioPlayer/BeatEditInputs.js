import React, { useState, useCallback } from 'react';
import { useData } from '../../contexts';
import { FormInput, SelectInput, SelectableInput } from '../Inputs';
import './BeatEditInputs.scss';

const BeatEditInputs = ({ currentBeat, onUpdateBeat }) => {
  const { genres, moods, keywords, features } = useData();
  const [title, setTitle] = useState(currentBeat.title || '');
  const [bpm, setBpm] = useState(currentBeat.bpm || '');
  const [tierlist, setTierlist] = useState(currentBeat.tierlist || '');

  const handleInputChange = useCallback((property, value) => {
    onUpdateBeat?.(currentBeat.id, { [property]: value });
  }, [currentBeat.id, onUpdateBeat]);

  const handleTitleChange = useCallback((e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    handleInputChange('title', newTitle);
  }, [handleInputChange]);

  const handleBpmChange = useCallback((e) => {
    const newBpm = e.target.value;
    setBpm(newBpm);
    handleInputChange('bpm', newBpm);
  }, [handleInputChange]);

  const handleTierlistChange = useCallback((e) => {
    const newTierlist = e.target.value;
    setTierlist(newTierlist);
    handleInputChange('tierlist', newTierlist);
  }, [handleInputChange]);



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