import React, { useState, useEffect, useRef } from 'react';
import { getBeats, deleteBeat, updateBeat } from '../../services';
import { useHandleBeatClick } from '../../hooks';
import ConfirmModal from '../ConfirmModal';
import BeatRow from './BeatRow';
import TableHeader from './TableHeader';
import './BeatList.scss';

const BeatList = ({ onPlay, selectedBeat, isPlaying }) => {
  const [beats, setBeats] = useState([]);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [beatToDelete, setBeatToDelete] = useState(null);
  const [playingBeat, setPlayingBeat] = useState(null);
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const { selectedBeats, handleBeatClick, setSelectedBeats } = useHandleBeatClick(beats);

  const tableRef = useRef(null);
  
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setSelectedBeats([]);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const styles = {
    table: { 
      tableLayout: 'auto', 
      overflowX: 'auto', 
      display: 'block', 
      whiteSpace: 'nowrap',
      overflow: 'visible',
      width: 'max-content',
    },
  };

  return (
    <div>
      <h2>Beats</h2>
      {beats.length > 0 ? (
        <div>
          <table className='beat-list__table' style={styles.table} ref={tableRef}>
            <TableHeader />
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
                  handleBeatClick={handleBeatClick}
                  selectedBeats={selectedBeats}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className='beat-list__warning'>No beats are added yet.</p>
      )}
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