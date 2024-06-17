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

  const tableRef = useRef(null);

  useEffect(() => {
    const fetchBeats = async () => {
      const fetchedBeats = await getBeats();
      setBeats(fetchedBeats);
      makeResizable();
    };
  
    fetchBeats();
  }, []);

  const makeResizable = () => {
    if (!tableRef.current) {
      return;
    }
  
    const headers = Array.from(tableRef.current.querySelectorAll('th'));
  
    headers.forEach((header, index) => {
      const savedWidth = localStorage.getItem(`headerWidth${index}`);
      if (savedWidth) {
        header.style.width = `${savedWidth}px`;
      }
    });
  
    headers.slice(1, -1).forEach((header, originalIndex) => {
      header.classList.add('resizable-header');
    
      document.addEventListener('mousemove', e => {
        const rect = header.getBoundingClientRect();
        const isNearBorder = e.clientX >= rect.right - 8 && e.clientX <= rect.right;
        const isOverHeader = e.clientY >= rect.top && e.clientY <= rect.bottom;
      
        if (isNearBorder && isOverHeader) {
          header.classList.add('near-border');
          header.style.cursor = 'col-resize';
        } else {
          if (!header.classList.contains('dragging')) {
            header.classList.remove('near-border');
            header.style.cursor = '';
          }
        }
      });
      
      header.addEventListener('mousedown', e => {
        e.preventDefault();
        
        const rect = header.getBoundingClientRect();
        const isNearBorder = e.clientX >= rect.right - 8 && e.clientX <= rect.right;
        if (!isNearBorder) return;
    
        const initialMouseX = e.clientX;
        const initialWidth = header.offsetWidth;
    
        header.classList.add('dragging', 'near-border');
    
        document.body.style.cursor = 'col-resize';
        document.body.classList.add('dragging');
    
        const onMouseMove = e => {
          const newWidth = initialWidth + e.clientX - initialMouseX;
          header.style.width = `${newWidth}px`;
    
          localStorage.setItem(`headerWidth${originalIndex + 1}`, newWidth);
        };
    
        const onMouseUp = () => {
          header.classList.remove('dragging', 'near-border');
          document.body.classList.remove('dragging');
    
          document.body.style.cursor = '';
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
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
      whiteSpace: 'nowrap',
      overflow: 'visible',
      width: 'max-content',
    },
    thead: { position: 'sticky', top: 0, backgroundColor: '#181818', color: '#FFFFFF', textAlign: 'left', zIndex: 2},
    tdata: { padding: '8px', color: '#FFFFFF'},
    theadFirstChild: { textAlign: 'center', width: '50px'},
    th: { 
      boxSizing: 'border-box',
      padding: '10px', 
      paddingLeft: '18px', 
      color: '#FFFFFF',
      minWidth: '60px',
    },
  };

  return (
    <div>
      <h2>Beats</h2>
      {beats.length > 0 ? (
        <div>
          <table className='beat-list__table' style={styles.table} ref={tableRef}>
            <thead style={styles.thead}>
              <tr>
                <th className='beat-list__table-head' style={{...styles.th, ...styles.theadFirstChild}}>#</th>
                <th className='beat-list__table-head' style={styles.th}>Title</th>
                <th className='beat-list__table-head' style={styles.th}>Genre</th>
                <th className='beat-list__table-head' style={styles.th}>BPM</th>
                <th className='beat-list__table-head' style={styles.th}>Tierlist</th>
                <th className='beat-list__table-head' style={styles.th}>Mood</th>
                <th className='beat-list__table-head' style={styles.th}>Keywords</th>
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