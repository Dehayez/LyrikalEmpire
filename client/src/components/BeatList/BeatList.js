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
  const tableRef = useRef(null);
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, beatsToDelete: [] });
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const [selectedBeatsForDeletion, setSelectedBeatsForDeletion] = useState([]);
  const { beats, handleUpdate, handleDelete, handleUpdateAll } = useBeatActions([]);
  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef);

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
        message={`Are you sure you want to delete ${confirmModalState.beatsToDelete.length > 1 ? ` ${confirmModalState.beatsToDelete.length} beats` : 'this beat'}?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalState({ isOpen: false, beatsToDelete: [] })}
      />
    </div>
  );
};

export default BeatList;