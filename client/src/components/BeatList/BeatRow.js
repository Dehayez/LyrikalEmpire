import React from 'react';
import { IoTrashBinOutline } from "react-icons/io5";
import BeatAnimation from './BeatAnimation';
import PlayPauseButton from './PlayPauseButton';
import './BeatRow.scss';

const styles = {
  tdata: { padding: '8px', color: '#FFFFFF'},
  numberColumnCell: { paddingLeft: '14px'},
  buttonCell: { position: 'relative', width: '100%', height: '100%'},
  playPauseButton: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, zIndex: 2 },
};

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
        <td style={{ ...styles.tdata, ...styles.numberColumnCell }} className="beat-number">
          <div style={styles.buttonCell}>
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
                styles={styles} 
            />
          </div>
        </td>
        <td style={{ color: selectedBeat && selectedBeat.id === beat.id ? '#FFCC44' : '' }}>
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.title} 
            onBlur={(e) => handleUpdate(beat.id, 'title', e.target.value)} 
            onKeyDown={(e) => { if (e.keyCode === 13) e.target.blur(); }}
          />
        </td>
        <td style={styles.tdata}>
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.genre} 
            onBlur={(e) => handleUpdate(beat.id, 'genre', e.target.value)} 
            onKeyDown={(e) => { if (e.keyCode === 13) e.target.blur(); }}
          />
        </td>
        <td style={styles.tdata}>
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.bpm} 
            onBlur={(e) => handleUpdate(beat.id, 'bpm', e.target.value)} 
            onKeyDown={(e) => { if (e.keyCode === 13) e.target.blur(); }}
          />
        </td>
        <td style={styles.tdata}>
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.tierlist} 
            onBlur={(e) => handleUpdate(beat.id, 'tierlist', e.target.value)} 
            onKeyDown={(e) => { if (e.keyCode === 13) e.target.blur(); }}
          />
        </td>
        <td style={styles.tdata}>
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.mood} 
            onBlur={(e) => handleUpdate(beat.id, 'mood', e.target.value)} 
            onKeyDown={(e) => { if (e.keyCode === 13) e.target.blur(); }}
          />
        </td>
        <td style={styles.tdata}>
          <input 
            className='beat-row__input' 
            type="text" 
            defaultValue={beat.keywords} 
            onBlur={(e) => handleUpdate(beat.id, 'keywords', e.target.value)} 
            onKeyDown={(e) => { if (e.keyCode === 13) e.target.blur(); }}
          />
        </td>
        <td style={styles.tdata}>
          <button className="icon-button" onClick={() => handleDelete(beat.id)}>
            <IoTrashBinOutline />
            <span className="tooltip">Delete</span>
          </button>
        </td>
      </tr>
    );
  };

  export default BeatRow;