import React, { useState, useEffect, useRef } from 'react';
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

  const tableRef = useRef(null); // Add this line

  useEffect(() => {
    const fetchBeats = async () => {
      const fetchedBeats = await getBeats();
      setBeats(fetchedBeats);
      makeResizable(); // Add this line
    };

    fetchBeats();
  }, []);

  const makeResizable = () => {
    const headers = Array.from(tableRef.current.querySelectorAll('th'));
  
    headers.slice(1, -1).forEach(header => {
      // Add hover effect
      header.classList.add('resizable-header');
      
      header.addEventListener('mousedown', e => {
        const initialMouseX = e.clientX;
        const initialWidth = header.offsetWidth;
      
        // Change cursor to 'drag' type
        document.body.style.cursor = 'col-resize';
      
        const onMouseMove = e => {
          const newWidth = initialWidth + e.clientX - initialMouseX;
          header.style.width = `${newWidth}px`;
        };
      
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      
          // Reset cursor and border
          document.body.style.cursor = '';
          header.classList.remove('resizable-header');
        };
      
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  };

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
    table: { 
      tableLayout: 'auto', 
      overflowX: 'auto', 
      display: 'block', 
      whiteSpace: 'nowrap' 
    },
    thead: { position: 'sticky', top: 0, backgroundColor: '#181818', color: '#FFFFFF', textAlign: 'left' },
    tdata: { padding: '8px', color: '#FFFFFF'},
    theadFirstChild: { textAlign: 'center', width: '50px'},
    th: { 
      boxSizing: 'border-box',
      padding: '10px', 
      paddingLeft: '18px', 
      color: '#FFFFFF',
      minWidth: '60px'
    },
  };

  return (
    <div>
      <h2>Beats</h2>
      <div>
        <table style={styles.table} ref={tableRef}>
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