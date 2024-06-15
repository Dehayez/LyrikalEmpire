import React from 'react';
import { IoTrashBinOutline } from "react-icons/io5";
import BeatAnimation from './BeatAnimation';
import PlayPauseButton from './PlayPauseButton';
import './BeatRow.scss';

const BeatRow = ({ beat, index, handlePlayPause, handleUpdate, handleDelete, selectedBeat, isPlaying, hoveredBeat, setHoveredBeat }) => {
    return (
      <tr
        className="beat-row"
        key={beat.id}
        onMouseEnter={(e) => {
          e.currentTarget.querySelector('button').style.opacity = 1;
          setHoveredBeat(beat.id);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.querySelector('button').style.opacity = 0;
          setHoveredBeat(null);
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
        <td className={selectedBeat && selectedBeat.id === beat.id ? 'beat-row__selected' : ''}>
          <input 
            className='beat-row__input' 
            type="text"
            defaultValue={beat.title} 
            onBlur={(e) => handleUpdate(beat.id, 'title', e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          />
        </td>
        <td className="beat-row__data">
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.genre} 
            onBlur={(e) => handleUpdate(beat.id, 'genre', e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          />
        </td>
        <td className="beat-row__data">
          <input 
            className='beat-row__input beat-row__input--bpm' 
            type="text" 
            defaultValue={beat.bpm} 
            onBlur={(e) => handleUpdate(beat.id, 'bpm', e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          />
        </td>
        <td className="beat-row__data">
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.tierlist} 
            onBlur={(e) => handleUpdate(beat.id, 'tierlist', e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          />
        </td>
        <td className="beat-row__data">
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.mood} 
            onBlur={(e) => handleUpdate(beat.id, 'mood', e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          />
        </td>
        <td className="beat-row__data">
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.keywords}
            onBlur={(e) => handleUpdate(beat.id, 'keywords', e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          />
        </td>
        <td className="beat-row__delete">
          <div className='beat-row__icon-button-container'>
            <button className="beat-row__icon-button icon-button" onClick={() => handleDelete(beat.id)}>
              <IoTrashBinOutline />
              <span className="beat-row__tooltip tooltip">Delete</span>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  export default BeatRow;