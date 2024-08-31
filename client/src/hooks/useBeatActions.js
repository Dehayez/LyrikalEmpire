import { useBeat } from '../contexts/BeatContext';
import { updateBeat, deleteBeat } from '../services';

export const useBeatActions = () => {
  const { beats, setBeats, setGlobalBeats } = useBeat();

  const handleUpdateAll = (newBeats) => {
    setBeats(newBeats);
    setGlobalBeats(newBeats);
  };

  const handleUpdate = async (id, key, value) => {
    const updatedValue = key === 'created_at' || key === 'edited_at' 
      ? new Date(value).toISOString().replace('T', ' ').replace('.000Z', '') 
      : value;
    const updatedBeat = { ...beats.find(beat => beat.id === id), [key]: updatedValue };
    
    // Update the database
    await updateBeat(id, updatedBeat);
    
    // Update the local state
    const updatedBeats = beats.map(beat => beat.id === id ? updatedBeat : beat);
    setBeats(updatedBeats);
    setGlobalBeats(updatedBeats);
  };

  const handleDelete = async (id) => {
    await deleteBeat(id);
    const updatedBeats = beats.filter(beat => beat.id !== id);
    setBeats(updatedBeats);
    setGlobalBeats(updatedBeats);
  };

  return { beats, handleUpdate, handleDelete, handleUpdateAll };
};