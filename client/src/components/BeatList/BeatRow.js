import React from 'react';
import { IoPlaySharp, IoPauseSharp, IoTrashBinOutline } from "react-icons/io5";

const styles = {
  tableContainer: { overflowX: 'auto', backgroundColor: '#181818', color: '#FFFFFF' },
  table: { minWidth: '600px', width: '100%', tableLayout: 'auto' },
  thead: { position: 'sticky', top: 0, backgroundColor: '#181818', color: '#FFFFFF', textAlign: 'left' },
  tdata: { padding: '8px', color: '#FFFFFF'},
  numberColumnCell: { paddingLeft: '14px'},
  theadFirstChild: { textAlign: 'center'},
  th: { padding: '10px', paddingLeft: '0', color: '#FFFFFF'},
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
            {selectedBeat && selectedBeat.id === beat.id && isPlaying ? 
              <div className="animation-container" style={{ animationDuration: `${60 / beat.bpm}s`, opacity: hoveredBeat === beat.id ? 0 : 1 }}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div> : 
              <div style={{ zIndex: 1, color: selectedBeat && selectedBeat.id === beat.id ? '#FFCC44' : '', opacity: hoveredBeat === beat.id ? 0 : 1 }}>{index + 1}</div>
            }
            <button
              style={styles.playPauseButton}
              className="icon-button"
              onClick={() => handlePlayPause(beat)}
            >
              {selectedBeat && selectedBeat.id === beat.id && isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
              <span className="tooltip">
                {selectedBeat && selectedBeat.id === beat.id && isPlaying ? 'Pause' : 'Play'}
              </span>
            </button>
          </div>
        </td>
        <td style={{ color: selectedBeat && selectedBeat.id === beat.id ? '#FFCC44' : '' }}>
          <input type="text" defaultValue={beat.title} onBlur={(e) => handleUpdate(beat.id, 'title', e.target.value)} />
        </td>
        <td style={styles.tdata}>
          <input type="text" defaultValue={beat.genre} onBlur={(e) => handleUpdate(beat.id, 'genre', e.target.value)} />
        </td>
        <td style={styles.tdata}>
          <input type="text" defaultValue={beat.bpm} onBlur={(e) => handleUpdate(beat.id, 'bpm', e.target.value)} />
        </td>
        <td style={styles.tdata}>
          <input type="text" defaultValue={beat.tierlist} onBlur={(e) => handleUpdate(beat.id, 'tierlist', e.target.value)} />
        </td>
        <td style={styles.tdata}>
          <input type="text" defaultValue={beat.mood} onBlur={(e) => handleUpdate(beat.id, 'mood', e.target.value)} />
        </td>
        <td style={styles.tdata}>
          <input type="text" defaultValue={beat.keywords} onBlur={(e) => handleUpdate(beat.id, 'keywords', e.target.value)} />
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