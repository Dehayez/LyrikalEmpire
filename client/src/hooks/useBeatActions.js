import { useState } from 'react';
import { updateBeat, deleteBeat } from '../services';

export const useBeatActions = (initialBeats, handleQueueUpdateAfterDelete) => {
  const [beats, setBeats] = useState(initialBeats);

  const handleUpdateAll = (newBeats) => {
    setBeats(newBeats);
  };

  const handleUpdate = async (id, key, value) => {
    const updatedValue = key === 'created_at' || key === 'edited_at' 
      ? new Date(value).toISOString().replace('T', ' ').replace('.000Z', '') 
      : value;
    const updatedBeat = { ...beats.find(beat => beat.id === id), [key]: updatedValue };
    await updateBeat(id, updatedBeat);
    setBeats(beats.map(beat => beat.id === id ? updatedBeat : beat));
  };

  const handleDelete = async (id) => {
    await deleteBeat(id);
    setBeats(beats.filter(beat => beat.id !== id));
    if (handleQueueUpdateAfterDelete) {
      handleQueueUpdateAfterDelete(id);
    }
  };

  return { beats, handleUpdate, handleDelete, handleUpdateAll };
};