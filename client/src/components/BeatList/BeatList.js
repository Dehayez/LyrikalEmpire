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

const BeatList = ({ onPlay, selectedBeat, isPlaying }) => {
  // State variables
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, beatsToDelete: [] });
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const [selectedBeatsForDeletion, setSelectedBeatsForDeletion] = useState([]);
  
  // Custom hooks
  const { beats, handleUpdate, handleDelete, handleUpdateAll } = useBeatActions([]);
  const tableRef = useRef(null);
  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef);

  // Fetch beats on component mount
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
    setConfirmModalState({ isOpen: true, beatsToDelete: selectedBeatsForDeletion });
  };

  const handlePlayPause = (beat) => {
    const isCurrentBeatPlaying = selectedBeat && selectedBeat.id === beat.id;
    onPlay(beat, !isCurrentBeatPlaying || !isPlaying, beats);
  };
  
  const handleRightClick = (beat, e) => {
    e.preventDefault();
    setSelectedBeatsForDeletion([...selectedBeatsForDeletion, beat.id]);
    // Show the new component with different actions here
  };

  return (
    <div>
      <h2>Beats</h2>
      {beats.length > 0 && (
        <div>
          <table className='beat-list__table' ref={tableRef}>
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
                  hoveredBeat={hoveredBeat}
                  setHoveredBeat={setHoveredBeat}
                  isPlaying={isPlaying}
                  handleBeatClick={handleBeatClick}
                  selectedBeats={selectedBeats}
                  openConfirmModal={openConfirmModal}
                  beats={beats}
                  handleRightClick={handleRightClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {beats.length === 0 && <p className='beat-list__warning'>No beats are added yet.</p>}
      <ConfirmModal
      isOpen={confirmModalState.isOpen}
      message={`Are you sure you want to delete ${confirmModalState.beatsToDelete.length > 1 ? 'these beats' : 'this beat'}?`}
      onConfirm={handleConfirm}
      onCancel={() => setConfirmModalState({ isOpen: false, beatsToDelete: [] })}
    />
    </div>
  );
};

export default BeatList;