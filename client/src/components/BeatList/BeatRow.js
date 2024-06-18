import React from 'react';
import classNames from 'classnames';
import { IoTrashBinOutline } from "react-icons/io5";
import BeatAnimation from './BeatAnimation';
import PlayPauseButton from './PlayPauseButton';
import './BeatRow.scss';

const BeatRow = ({ beat, index, handlePlayPause, handleUpdate, selectedBeat, isPlaying, hoveredBeat, setHoveredBeat, selectedBeats = [], handleBeatClick, openConfirmModal, beats }) => {
  // Create a map of beat ids to their indices
  const beatIndices = beats.reduce((acc, b, i) => ({ ...acc, [b.id]: i }), {});

  const isSelected = selectedBeats.map(b => b.id).includes(beat.id);
  const hasSelectedBefore = selectedBeats.some(b => beatIndices[b.id] === beatIndices[beat.id] - 1);
  const hasSelectedAfter = selectedBeats.some(b => beatIndices[b.id] === beatIndices[beat.id] + 1);
  const isMiddle = hasSelectedBefore && hasSelectedAfter;


  const beatRowClasses = classNames({
    'beat-row': true,
    'beat-row--selected-middle': isSelected && isMiddle,
    'beat-row--selected-bottom': isSelected && !isMiddle && hasSelectedBefore,
    'beat-row--selected-top': isSelected && !isMiddle && hasSelectedAfter,
    'beat-row--selected': isSelected && !isMiddle && !hasSelectedBefore && !hasSelectedAfter
  });

  // Add a key prop that changes when the class name changes
  const key = beatRowClasses;

  return (
    <tr
      className={beatRowClasses}
      key={key}
      onMouseEnter={(e) => {
        e.currentTarget.querySelector('button').style.opacity = 1;
        setHoveredBeat(beat.id);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.querySelector('button').style.opacity = 0;
        setHoveredBeat(null);
      }}
      onClick={(e) => handleBeatClick(beat, e)}
    >
        <td className="beat-row__number">
          <div className="beat-row__button-cell">
            <BeatAnimation 
                beat={beat} 
                selectedBeat={selectedBeat} 
                isPlaying={isPlaying} 
                hoveredBeat={hoveredBeat} 
                index={index} 
            />
            <PlayPauseButton 
                beat={beat} 
                handlePlayPause={handlePlayPause} 
                selectedBeat={selectedBeat} 
                isPlaying={isPlaying} 
            />
          </div>
        </td>
        <td className={selectedBeat && selectedBeat.id === beat.id ? 'beat-row__selected' : ''}>
          <input 
            className='beat-row__input beat-row__input--title'
            type="text"
            defaultValue={beat.title} 
            onBlur={(e) => handleUpdate(beat.id, 'title', e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={(e) => e.stopPropagation()} 
            spellCheck="false"
          />
        </td>
        <td className="beat-row__data">
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.genre} 
            onBlur={(e) => handleUpdate(beat.id, 'genre', e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={(e) => e.stopPropagation()} 
            spellCheck="false"
          />
        </td>
        <td className="beat-row__data">
          <input 
            className='beat-row__input beat-row__input--bpm' 
            type="text" 
            defaultValue={beat.bpm} 
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
                handleUpdate(beat.id, 'bpm', null);
                return;
              }
            
              // Replace comma with dot and parse as float
              let bpm = parseFloat(e.target.value.replace(',', '.'));
            
              // Round to nearest integer
              bpm = Math.round(bpm);
            
              // Validate that the input is a positive number (integer or decimal)
              // and within the range of 20 to 240 BPM
              if (isNaN(bpm) || bpm <= 0 || bpm > 240) {
                alert('Please enter a valid BPM (1-240) or leave it empty.');
                e.target.focus();
              } else {
                // Update the input field with the rounded BPM value
                e.target.value = bpm;
            
                handleUpdate(beat.id, 'bpm', bpm);
              }
            }}
            onClick={(e) => e.stopPropagation()} 
            spellCheck="false"
          />
        </td>
        <td className="beat-row__data">
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.tierlist} 
            onBlur={(e) => handleUpdate(beat.id, 'tierlist', e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={(e) => e.stopPropagation()} 
            spellCheck="false"
          />
        </td>
        <td className="beat-row__data">
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.mood} 
            onBlur={(e) => handleUpdate(beat.id, 'mood', e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={(e) => e.stopPropagation()} 
            spellCheck="false"
          />
        </td>
        <td className="beat-row__data">
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.keywords}
            onBlur={(e) => handleUpdate(beat.id, 'keywords', e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={(e) => e.stopPropagation()} 
            spellCheck="false"
          />
        </td>
        <td className="beat-row__delete">
          <div className='beat-row__icon-button-container'>
          <button className="beat-row__icon-button icon-button beat-row__delete-button" onClick={() => openConfirmModal(beat.id)}>
            <IoTrashBinOutline />
            <span className="beat-row__tooltip tooltip">Delete</span>
          </button>
          </div>
        </td>
      </tr>
    );
  };

  export default BeatRow;