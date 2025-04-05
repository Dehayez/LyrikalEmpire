import { useBeat } from '../contexts/BeatContext';
import { updateBeat, deleteBeat } from '../services';
import { useUser } from '../contexts/UserContext';

export const useBeatActions = () => {
  const { beats, setBeats, setGlobalBeats } = useBeat();
  const { user } = useUser();

  const handleUpload = async (beat, audioFile, userId) => {
    console.log('Starting upload...');
    const startTime = Date.now();

    await addBeat(beat, audioFile, userId, (percentage) => {
      const elapsedTime = Date.now() - startTime;
      console.log(`Upload progress: ${percentage}% (Elapsed time: ${elapsedTime}ms)`);
    });

    console.log('Upload complete');
  };

  const handleUpdate = async (id, key, value) => {
    const updatedValue = key === 'created_at' || key === 'edited_at' 
      ? new Date(value).toISOString().replace('T', ' ').replace('.000Z', '') 
      : value;
    const updatedBeat = { ...beats.find(beat => beat.id === id), [key]: updatedValue };
    
    await updateBeat(id, updatedBeat);
    
    const updatedBeats = beats.map(beat => beat.id === id ? updatedBeat : beat);
    setBeats(updatedBeats);
    setGlobalBeats(updatedBeats);
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

  return { beats, handleUpdate, handleDelete, handleUpdateAll, handleUpload };
};