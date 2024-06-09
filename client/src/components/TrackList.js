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

  const styles = {
    tableContainer: {
      overflowX: 'auto', // Add horizontal scrolling
    },
    table: {
      minWidth: '600px', // Set a minimum width for the table
      width: '100%',
      tableLayout: 'auto',
    },
    thead: {
      position: 'sticky',
      top: 0,
      backgroundColor: '#fff',
      textAlign: 'left', // Left align headers
    },
  };

  return (
    <div>
      <h2>Track List</h2>
      <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th>Title</th>
            <th>Genre</th>
            <th>BPM</th>
            <th>Mood</th>
            <th>Audio</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map(track => {
            return (
              <tr key={track.id}>
                <td>{track.title}</td>
                <td>{track.genre}</td>
                <td>{track.bpm}</td>
                <td>{track.mood}</td>
                <td>
                  <audio controls>
                    <source src={`/${track.audio}`} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </td>
                <td style={styles.td}>
                  <button style={styles.deleteButton} onClick={() => handleDelete(track.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
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