import React, { useState, useEffect } from 'react';
import { getBeats, deleteBeat } from '../../services/beatService';
import ConfirmModal from '../ConfirmModal';
import { IoPlaySharp, IoPauseSharp, IoTrashBinOutline } from "react-icons/io5";
import './BeatList.scss';

const BeatList = ({ onPlay, selectedBeat, isPlaying }) => {
  const [beats, setBeats] = useState([]);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [beatToDelete, setBeatToDelete] = useState(null);
  const [playingBeat, setPlayingBeat] = useState(null);
  const [hoveredBeat, setHoveredBeat] = useState(null);

  useEffect(() => {
    const fetchBeats = async () => {
      const fetchedBeats = await getBeats();
      setBeats(fetchedBeats);
    };

    fetchBeats();
  }, []);

  const handleDelete = (id) => {
    setBeatToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (beatToDelete) {
      await deleteBeat(beatToDelete);
      setBeats((prevBeats) => prevBeats.filter(beat => beat.id !== beatToDelete));
    }
    setConfirmOpen(false);
  };

  const handlePlayPause = (beat) => {
    const isCurrentBeatPlaying = selectedBeat && selectedBeat.id === beat.id;
    onPlay(beat, !isCurrentBeatPlaying || !isPlaying, beats);
    setPlayingBeat(beat);
  };

  const styles = {
    tableContainer: { overflowX: 'auto', backgroundColor: '#181818', color: '#FFFFFF' },
    table: { minWidth: '600px', width: '100%', tableLayout: 'auto' },
    thead: { position: 'sticky', top: 0, backgroundColor: '#181818', color: '#FFFFFF', textAlign: 'left' },
    tdata: { padding: '14px', paddingLeft: '0', color: '#FFFFFF'},
    numberColumnCell: { paddingLeft: '14px'},
    theadFirstChild: { textAlign: 'center'},
    th: { padding: '10px', paddingLeft: '0', color: '#FFFFFF'},
    buttonCell: { position: 'relative', width: '100%', height: '100%'},
    playPauseButton: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, zIndex: 2 },
  };

  return (
    <div>
      <h2>Beats</h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.theadFirstChild}>#</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Genre</th>
              <th style={styles.th}>BPM</th>
              <th style={styles.th}>Mood</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {beats.map((beat, index) => (
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
                      {playingBeat && playingBeat.id === beat.id && isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
                      <span className="tooltip">
                        {playingBeat && playingBeat.id === beat.id && isPlaying ? 'Pause' : 'Play'}
                      </span>
                    </button>
                  </div>
                </td>
                <td style={{ color: selectedBeat && selectedBeat.id === beat.id ? '#FFCC44' : '' }}>{beat.title}</td>
                <td style={styles.tdata}>{beat.genre}</td>
                <td style={styles.tdata}>{beat.bpm}</td>
                <td style={styles.tdata}>{beat.mood}</td>
                <td style={styles.tdata}>
                  <button className="icon-button" onClick={() => handleDelete(beat.id)}>
                    <IoTrashBinOutline />
                    <span className="tooltip">Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        isOpen={isConfirmOpen}
        message="Are you sure you want to delete this beat?"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default BeatList;