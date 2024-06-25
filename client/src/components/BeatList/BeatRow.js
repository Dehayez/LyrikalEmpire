import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { IoTrashBinSharp, IoAddSharp } from "react-icons/io5";
import BeatAnimation from './BeatAnimation';
import PlayPauseButton from './PlayPauseButton';
import { useBpmHandlers } from '../../hooks';
import './BeatRow.scss';

const BeatRow = ({
  beat, index, handlePlayPause, handleUpdate, selectedBeat, isPlaying, 
  hoveredBeat, setHoveredBeat, selectedBeats = [], handleBeatClick, 
  openConfirmModal, beats, handleRightClick, activeContextMenu, setActiveContextMenu, currentBeat
}) => {
  const beatIndices = beats.reduce((acc, b, i) => ({ ...acc, [b.id]: i }), {});
  const isSelected = selectedBeats.map(b => b.id).includes(beat.id);
  const hasSelectedBefore = selectedBeats.some(b => beatIndices[b.id] === beatIndices[beat.id] - 1);
  const hasSelectedAfter = selectedBeats.some(b => beatIndices[b.id] === beatIndices[beat.id] + 1);
  const isMiddle = hasSelectedBefore && hasSelectedAfter;

  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);

  const deleteText = selectedBeats.length > 1 ? `Delete ${selectedBeats.length} beats` : 'Delete this beat';

  const { handleOnKeyDown, handleBpmBlur } = useBpmHandlers(handleUpdate, beat);

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
        <td className={selectedBeat && selectedBeat.id === beat.id ? 'beat-row--playing' : ''}>
          <input 
            className='beat-row__input beat-row__input--title'
            type="text"
            defaultValue={beat.title} 
            onBlur={(e) => handleUpdate(beat.id, 'title', e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={(e) => { if (selectedBeats.length === 0) e.stopPropagation(); }}
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
            onClick={(e) => { if (selectedBeats.length === 0) e.stopPropagation(); }}
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
            onClick={(e) => { if (selectedBeats.length === 0) e.stopPropagation(); }}
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
            onClick={(e) => { if (selectedBeats.length === 0) e.stopPropagation(); }}
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
            onClick={(e) => { if (selectedBeats.length === 0) e.stopPropagation(); }}
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
            onClick={(e) => { if (selectedBeats.length === 0) e.stopPropagation(); }}
            spellCheck="false"
          />
        </td> 
      {activeContextMenu === beat.id && (
        <td>
          <div className="row-context" style={{position: 'fixed', top: contextMenuY, left: contextMenuX}}>
            <div className="row-context__button row-context__button--add-playlist">
              <IoAddSharp className="row-context__icon row-context__icon--add-playlist" />
              <p className="row-context__text">Add to playlist</p>
            </div>
            <div className="row-context__button row-context__button--delete" onClick={() => openConfirmModal(beat.id)}>
              <IoTrashBinSharp className="row-context__icon row-context__icon--delete" />
              <p className="row-context__text">{deleteText}</p>
            </div>
          </div>
        </td>
      )}
      </tr>
    );
  };

  export default BeatRow;