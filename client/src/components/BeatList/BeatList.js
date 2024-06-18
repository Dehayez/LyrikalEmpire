import React, { useEffect, useRef, useState } from 'react';
import { getBeats } from '../../services';
import { useHandleBeatClick, useBeatActions } from '../../hooks';
import ConfirmModal from '../ConfirmModal';
import BeatRow from './BeatRow';
import TableHeader from './TableHeader';
import './BeatList.scss';

const BeatList = ({ onPlay, selectedBeat, isPlaying }) => {
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [beatToDelete, setBeatToDelete] = useState(null);
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const { beats, handleUpdate, handleDelete, handleUpdateAll } = useBeatActions([]);
  const tableRef = useRef(null);
  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef);

  useEffect(() => {
    const fetchBeats = async () => {
      const fetchedBeats = await getBeats();
      handleUpdateAll(fetchedBeats);
    };
    fetchBeats();
  }, [handleUpdateAll]);

  const handleConfirm = async () => {
    if (beatToDelete) {
      await handleDelete(beatToDelete);
      setConfirmOpen(false);
    }
  };

  const handlePlayPause = (beat) => {
    const isCurrentBeatPlaying = selectedBeat && selectedBeat.id === beat.id;
    onPlay(beat, !isCurrentBeatPlaying || !isPlaying, beats);
  };

  return (
    <div>
      <h2>Beats</h2>
      {beats.length > 0 ? (
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