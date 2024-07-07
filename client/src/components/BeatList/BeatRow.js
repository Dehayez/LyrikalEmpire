import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { IoTrashBinSharp, IoAddSharp, IoListSharp } from "react-icons/io5";
import { useBpmHandlers, useSelectableList } from '../../hooks';
import { getGenres, getKeywords, getMoods } from '../../services';
import BeatAnimation from './BeatAnimation';
import PlayPauseButton from './PlayPauseButton';
import { ContextMenu } from '../ContextMenu';
import { Highlight } from '../Highlight';
import { SelectableInput } from '../Inputs';
import './BeatRow.scss';

const BeatRow = ({
  beat, index, handlePlayPause, handleUpdate, isPlaying, 
  hoveredBeat, setHoveredBeat, selectedBeats = [], handleBeatClick, 
  openConfirmModal, beats, handleRightClick, activeContextMenu, setActiveContextMenu, currentBeat, addToCustomQueue, searchText
}) => {
  const beatIndices = beats.reduce((acc, b, i) => ({ ...acc, [b.id]: i }), {});
  const isSelected = selectedBeats.map(b => b.id).includes(beat.id);
  const hasSelectedBefore = selectedBeats.some(b => beatIndices[b.id] === beatIndices[beat.id] - 1);
  const hasSelectedAfter = selectedBeats.some(b => beatIndices[b.id] === beatIndices[beat.id] + 1);
  const isMiddle = hasSelectedBefore && hasSelectedAfter;
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);
  const { handleOnKeyDown, handleBpmBlur } = useBpmHandlers(handleUpdate, beat);
  const [tierlist, setTierlist] = useState(beat.tierlist || '');
  const deleteText = selectedBeats.length > 1 ? `Delete ${selectedBeats.length} beats` : 'Delete this beat';
  const [isInputFocused, setInputFocused] = useState(false);

  const beatRowClasses = classNames({
    'beat-row': true,
    'beat-row--selected-middle': isSelected && isMiddle,
    'beat-row--selected-bottom': isSelected && !isMiddle && hasSelectedBefore,
    'beat-row--selected-top': isSelected && !isMiddle && hasSelectedAfter,
    'beat-row--selected': isSelected && !isMiddle && !hasSelectedBefore && !hasSelectedAfter,
    'beat-row--playing': currentBeat && beat.id === currentBeat.id
  });

  useEffect(() => {
    const hideContextMenu = () => {
      setActiveContextMenu(null);
    };
  
    if (activeContextMenu === beat.id) {
      window.addEventListener('click', hideContextMenu);
      document.body.classList.add('no-scroll');
    } else {
      window.removeEventListener('click', hideContextMenu);
      document.body.classList.remove('no-scroll');
    }
  
    return () => {
      window.removeEventListener('click', hideContextMenu);
      document.body.classList.remove('no-scroll');
    };
  }, [activeContextMenu, beat.id]);

  const handleTierlistChange = (e) => {
    const newTierlist = e.target.value;
    setTierlist(newTierlist);
    handleUpdate(beat.id, 'tierlist', newTierlist);
  };

  const handleAddToCustomQueueClick = () => {
    addToCustomQueue(selectedBeats);
  };

  const {
    selectedItem: selectedGenre,
    filteredItems: filteredGenres,
    showItems: showGenres,
    handleItemChange: handleGenreChange,
    handleItemToggle: handleGenreToggle,
    handleItemFocus: handleGenreFocus,
    handleItemBlur: handleGenreBlur
  } = useSelectableList(getGenres, beat.genre);

  useEffect(() => {
    if (selectedGenre) {
      handleUpdate(beat.id, 'genre', selectedGenre);
    }
  }, [selectedGenre]);

  const {
    selectedItem: selectedMood,
    filteredItems: filteredMoods,
    showItems: showMoods,
    handleItemChange: handleMoodChange,
    handleItemToggle: handleMoodToggle,
    handleItemFocus: handleMoodFocus,
    handleItemBlur: handleMoodBlur
  } = useSelectableList(getMoods, beat.mood);
  
  useEffect(() => {
    if (selectedMood) {
      handleUpdate(beat.id, 'mood', selectedMood);
    }
  }, [selectedMood]);

  const {
    selectedItem: selectedKeyword,
    filteredItems: filteredKeywords,
    showItems: showKeywords,
    handleItemChange: handleKeywordChange,
    handleItemToggle: handleKeywordToggle,
    handleItemFocus: handleKeywordFocus,
    handleItemBlur: handleKeywordBlur
  } = useSelectableList(getKeywords, beat.keywords);
  
  useEffect(() => {
    if (selectedKeyword) {
      handleUpdate(beat.id, 'keywords', selectedKeyword);
    }
  }, [selectedKeyword]);

  return (
    <tr
      className={beatRowClasses}
      key={beatRowClasses}
      onMouseEnter={(e) => {
        e.currentTarget.querySelector('button').style.opacity = 1;
        setHoveredBeat(beat.id);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.querySelector('button').style.opacity = 0;
        setHoveredBeat(null);
      }}
      onClick={(e) => handleBeatClick(beat, e)}
      onContextMenu={(e) => {
        e.preventDefault();
        handleRightClick(e, beat);
        setActiveContextMenu(beat.id);
        setContextMenuX(e.clientX);
        setContextMenuY(e.clientY);
      }}
    >
      <td className="beat-row__number">
        <div className="beat-row__button-cell">
          <BeatAnimation 
            beat={beat} 
            currentBeat={currentBeat} 
            isPlaying={isPlaying} 
            hoveredBeat={hoveredBeat} 
            index={index} 
          />
          <PlayPauseButton 
            beat={beat} 
            handlePlayPause={handlePlayPause}
            currentBeat={currentBeat} 
            isPlaying={isPlaying} 
          />
        </div>
      </td>
      <td>
        {!isInputFocused && <Highlight text={beat.title} highlight={searchText} />}
        <input 
          className='beat-row__input beat-row__input--title'
          type="text"
          defaultValue={beat.title} 
          onFocus={() => setInputFocused(true)}
          onBlur={(e) => {
            setInputFocused(false);
            handleUpdate(beat.id, 'title', e.target.value);
          }}
          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          onClick={(e) => e.stopPropagation()}
          spellCheck="false"
        />
      </td>
        <td className="beat-row__data">
          <Highlight text={beat.genre || ''} highlight={searchText || ''} />
          <SelectableInput
              value={selectedGenre}
              onChange={handleGenreChange}
              onFocus={handleGenreFocus}
              onBlur={handleGenreBlur}
              showItems={showGenres}
              filteredItems={filteredGenres}
              handleItemToggle={handleGenreToggle}
              className='beat-row__input' 
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
            onKeyDown={handleOnKeyDown}
            onBlur={handleBpmBlur}
            onClick={(e) => e.stopPropagation()}
            spellCheck="false"
          />
        </td>
        <td className="beat-row__data">
          <div className="form-group">
          <div className="select-wrapper">
              <select 
                className="select-wrapper__select" 
                value={tierlist}
                onChange={handleTierlistChange}
                onFocus={(e) => e.target.style.color = 'white'}
                onBlur={(e) => e.target.style.color = tierlist ? 'white' : 'grey'}
                onClick={(e) => e.stopPropagation()}
                style={{color: tierlist ? 'white' : 'grey'}}
              >
                <option value="G">G</option>
                <option value="S">S</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value=""></option>
              </select>
              </div>
          </div>
        </td>
        <td className="beat-row__data">
          <SelectableInput
            value={selectedMood}
            onChange={handleMoodChange}
            onFocus={handleMoodFocus}
            onBlur={handleMoodBlur}
            showItems={showMoods}
            filteredItems={filteredMoods}
            handleItemToggle={handleMoodToggle}
            className='beat-row__input' 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={(e) => e.stopPropagation()}
            spellCheck="false"
          />
        </td>
        <td className="beat-row__data">
          <SelectableInput
            value={selectedKeyword}
            onChange={handleKeywordChange}
            onFocus={handleKeywordFocus}
            onBlur={handleKeywordBlur}
            showItems={showKeywords}
            filteredItems={filteredKeywords}
            handleItemToggle={handleKeywordToggle}
            className='beat-row__input' 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={(e) => e.stopPropagation()}
            spellCheck="false"
          />
        </td> 
        
      {activeContextMenu === beat.id && (
        <td className="beat-row__data">
         <ContextMenu
            position={{ top: contextMenuY, left: contextMenuX }}
            items={[
              {
                icon: IoAddSharp,
                iconClass: 'add-playlist',
                text: 'Add to playlist',
                buttonClass: 'add-playlist',
                onClick: () => console.log('Add to playlist clicked'),
              },
              {
                icon: IoListSharp,
                iconClass: 'add-queue',
                text: 'Add to queue',
                buttonClass: 'add-queue',
                onClick: handleAddToCustomQueueClick,
              },
              {
                icon: IoTrashBinSharp,
                iconClass: 'delete',
                text: deleteText,
                buttonClass: 'delete',
                onClick: () => openConfirmModal(beat.id),
              },
            ]}
          />
        </td>
      )}
      </tr>
    );
  };

  export default BeatRow;