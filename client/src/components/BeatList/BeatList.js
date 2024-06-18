import React, { useEffect, useRef, useState } from 'react';
import { getBeats } from '../../services';
import { useHandleBeatClick, useBeatActions } from '../../hooks';
import ConfirmModal from '../ConfirmModal';
import BeatRow from './BeatRow';
import TableHeader from './TableHeader';
import './BeatList.scss';

const fetchBeats = async (handleUpdateAll) => {
  const fetchedBeats = await getBeats();
  handleUpdateAll(fetchedBeats);
};

const BeatList = ({ onPlay, selectedBeat, isPlaying }) => {
  // State variables
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, beatToDelete: null });
  const [hoveredBeat, setHoveredBeat] = useState(null);
  
  // Custom hooks
  const { beats, handleUpdate, handleDelete, handleUpdateAll } = useBeatActions([]);
  const tableRef = useRef(null);
  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef);

  // Fetch beats on component mount
  useEffect(() => {
    fetchBeats(handleUpdateAll);
  }, [handleUpdateAll]);

  const handleConfirm = async () => {
    if (confirmModalState.beatToDelete) {
      await handleDelete(confirmModalState.beatToDelete);
      setConfirmModalState({ isOpen: false, beatToDelete: null });
    }
  };

  const handlePlayPause = (beat) => {
    const isCurrentBeatPlaying = selectedBeat && selectedBeat.id === beat.id;
    onPlay(beat, !isCurrentBeatPlaying || !isPlaying, beats);
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
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {beats.length === 0 && <p className='beat-list__warning'>No beats are added yet.</p>}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        message="Are you sure you want to delete this beat?"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalState({ isOpen: false, beatToDelete: null })}
      />
    </div>
  );
};

export default BeatList;