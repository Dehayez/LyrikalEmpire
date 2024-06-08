import React, { useState, useEffect } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { getTracks, deleteTrack } from '../services/trackService';

const TrackList = () => {
  const [tracks, setTracks] = useState([]);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState(null);

  const fetchTracks = async () => {
    const tracks = await getTracks();
    setTracks(tracks);
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleDelete = (id) => {
    setTrackToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (trackToDelete) {
      await deleteTrack(trackToDelete);
      fetchTracks();
    }
    setConfirmOpen(false);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  return (
    <div>
      <h2>Track List</h2>
      <ul>
        {tracks.map(track => (
          <li key={track.id}>
            Title: {track.title} | Genre: {track.genre} | BPM: {track.bpm} | Mood: {track.mood}
            <button onClick={() => handleDelete(track.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        message="Are you sure you want to delete this track?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TrackList;