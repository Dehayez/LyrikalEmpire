import { useBeat } from '../contexts/BeatContext';
import { updateBeat, deleteBeat } from '../services';
import { useUser } from '../contexts/UserContext';

export const useBeatActions = () => {
  const { beats, setBeats, setGlobalBeats } = useBeat();
  const { user } = useUser();

  const handleUpdate = async (id, key, value) => {
    try {
      const updatedValue = key === 'created_at' || key === 'edited_at' 
        ? new Date(value).toISOString().replace('T', ' ').replace('.000Z', '') 
        : value;
      const updatedBeat = { ...beats.find(beat => beat.id === id), [key]: updatedValue };
      
      await updateBeat(id, updatedBeat);
      
      const updatedBeats = beats.map(beat => beat.id === id ? updatedBeat : beat);
      setBeats(updatedBeats);
      setGlobalBeats(updatedBeats);
    } catch (error) {
      console.error('Error updating beat on server:', error);
      // Don't update local state if server update fails
    }
  };

  const handleDelete = async (id) => {
    await deleteBeat(id, user.id);
    const updatedBeats = beats.filter(beat => beat.id !== id);
    setBeats(updatedBeats);
    setGlobalBeats(updatedBeats);
  };

  const handleUpdateAll = (newBeats) => {
    setBeats(newBeats);
    setGlobalBeats(newBeats);
  };

  return { beats, handleUpdate, handleDelete, handleUpdateAll };
};