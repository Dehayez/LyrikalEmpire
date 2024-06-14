import React, { useState, useEffect } from 'react';
import { getBeats, deleteBeat, updateBeat } from '../../services/beatService';
import ConfirmModal from '../ConfirmModal';
import BeatRow from './BeatRow';
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

  const handleUpdate = async (id, key, value) => {
    let updatedValue = value;
    if (key === 'created_at' || key === 'edited_at') {
      const date = new Date(value);
      updatedValue = date.toISOString().replace('T', ' ').replace('.000Z', '');
    }
    const updatedBeat = { ...beats.find(beat => beat.id === id), [key]: updatedValue };
    await updateBeat(id, updatedBeat);
    setBeats(beats.map(beat => beat.id === id ? updatedBeat : beat));
  };

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
              <th style={styles.th}>Tierlist</th>
              <th style={styles.th}>Mood</th>
              <th style={styles.th}>Keywords</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {beats.map((beat, index) => (
              <BeatRow
                key={beat.id}
                beat={beat}
                index={index}
                handlePlayPause={handlePlayPause}
                handleUpdate={handleUpdate}
                handleDelete={handleDelete}
                selectedBeat={selectedBeat}
                isPlaying={isPlaying}
                hoveredBeat={hoveredBeat}
                setHoveredBeat={setHoveredBeat}
              />
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