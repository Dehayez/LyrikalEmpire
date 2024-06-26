import React, { useEffect, useRef, useState } from 'react';
import { getBeats } from '../../services';
import { useHandleBeatClick, useBeatActions } from '../../hooks';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import BeatRow from './BeatRow';
import TableHeader from './TableHeader';
import './BeatList.scss';

const fetchBeats = async (handleUpdateAll) => {
  const fetchedBeats = await getBeats();
  handleUpdateAll(fetchedBeats);
};

const BeatList = ({ onPlay, selectedBeat, isPlaying, handleQueueUpdateAfterDelete, currentBeat }) => {
  const tableRef = useRef(null);
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, beatsToDelete: [] });
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const [selectedBeatsForDeletion, setSelectedBeatsForDeletion] = useState([]);
  const { beats, handleUpdate, handleDelete, handleUpdateAll } = useBeatActions([], handleQueueUpdateAfterDelete);
  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef, currentBeat);
  const [activeContextMenu, setActiveContextMenu] = useState(null);

  useEffect(() => {
    fetchBeats(handleUpdateAll);
  }, [handleUpdateAll]);

  const handleConfirm = async () => {
    if (confirmModalState.beatsToDelete.length > 0) {
      await Promise.all(confirmModalState.beatsToDelete.map(beatId => handleDelete(beatId)));
      setConfirmModalState({ isOpen: false, beatsToDelete: [] });
      setSelectedBeatsForDeletion([]);
    }
  };

  const openConfirmModal = () => {
    setConfirmModalState({ isOpen: true, beatsToDelete: selectedBeats.map(beat => beat.id) });
  };

  const handlePlayPause = (beat) => {
    const isCurrentBeatPlaying = selectedBeat && selectedBeat.id === beat.id;
    onPlay(beat, !isCurrentBeatPlaying || !isPlaying, beats);
  };
  
  const handleRightClick = (e, beat) => {
    e.preventDefault();
    if (!selectedBeats.some(selectedBeat => selectedBeat.id === beat.id)) {
      handleBeatClick(beat, e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && selectedBeats.length > 0) {
        const beatToPlay = selectedBeats[0];
        handlePlayPause(beatToPlay);
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBeats, handlePlayPause]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log(`Key pressed: ${event.key}, Selected beats length: ${selectedBeats.length}`); // Debugging line
      if ((event.key === 'Delete' || event.key === 'Backspace' || event.keyCode === 46) && selectedBeats.length > 0) {
        setConfirmModalState({ isOpen: true, beatsToDelete: selectedBeats.map(beat => beat.id) });
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBeats]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const onSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedBeats = React.useMemo(() => {
    let sortableBeats = [...beats];
    if (sortConfig.key !== null) {
      sortableBeats.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBeats;
  }, [beats, sortConfig]);


  return (
    <div className='beat-list'>
      <h2 className='beat-list__title'>Beats</h2>
      {beats.length > 0 && (
        <div>
          <table className='beat-list__table' ref={tableRef}>
            <TableHeader onSort={onSort} />
            <tbody>
              {sortedBeats.map((beat, index) => (
                <BeatRow
                  key={beat.id}
                  beat={beat}
                  currentBeat={currentBeat}
                  index={index}
                  handlePlayPause={handlePlayPause}
                  handleUpdate={handleUpdate}
                  handleDelete={handleDelete}
                  selectedBeat={selectedBeat}
                  hoveredBeat={hoveredBeat}
                  setHoveredBeat={setHoveredBeat}
                  isPlaying={isPlaying}
                  handleBeatClick={handleBeatClick}
                  selectedBeats={selectedBeats}
                  openConfirmModal={openConfirmModal}
                  beats={beats}
                  handleRightClick={handleRightClick}
                  activeContextMenu={activeContextMenu}
                  setActiveContextMenu={setActiveContextMenu}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {beats.length === 0 && <p className='beat-list__warning'>No beats are added yet.</p>}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        message={`Are you sure you want to delete ${confirmModalState.beatsToDelete.length > 1 ? ` ${confirmModalState.beatsToDelete.length} beats` : 'this beat'}?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalState({ isOpen: false, beatsToDelete: [] })}
      />
    </div>
  );
};

export default BeatList;