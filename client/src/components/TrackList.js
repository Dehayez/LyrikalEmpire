import React, { useState, useEffect } from 'react';
import { getTracks, deleteTrack } from '../services/trackService';
import ConfirmDialog from './ConfirmDialog';
import { IoIosPause, IoIosPlay, IoIosTrash } from "react-icons/io";
import './TrackList.css';

const TrackList = ({ onPlay, selectedTrack, isPlaying }) => {
  const [tracks, setTracks] = useState([]);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState(null);
  const [playingTrack, setPlayingTrack] = useState(null);

  useEffect(() => {
    const fetchTracks = async () => {
      const fetchedTracks = await getTracks();
      setTracks(fetchedTracks);
    };

    fetchTracks();
  }, []);

  const handleDelete = (id) => {
    setTrackToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (trackToDelete) {
      await deleteTrack(trackToDelete);
      setTracks((prevTracks) => prevTracks.filter(track => track.id !== trackToDelete));
    }
    setConfirmOpen(false);
  };

  const handlePlayPause = (track) => {
    const isCurrentTrackPlaying = selectedTrack && selectedTrack.id === track.id;
    onPlay(track, !isCurrentTrackPlaying || !isPlaying);
    setPlayingTrack(track);
  };

  const styles = {
    tableContainer: { overflowX: 'auto' },
    table: { minWidth: '600px', width: '100%', tableLayout: 'auto' },
    thead: { position: 'sticky', top: 0, backgroundColor: '#fff', textAlign: 'left' },
    tdata: { padding: '8px' }
  };

  return (
    <div>
      <h2>Track List</h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Genre</th>
              <th>BPM</th>
              <th>Mood</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr
                className="track-row"
                key={track.id}
                onMouseEnter={(e) => e.currentTarget.querySelector('button').style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.querySelector('button').style.opacity = 0}
              >
                <td style={styles.tdata} className="track-number">
                  <div style={{ position: 'relative' }}>
                    <div className="center-container">
                      {selectedTrack && selectedTrack.id === track.id && isPlaying ? 
                        <div style={{ animationDuration: `${60 / track.bpm}s` }}>
                          <div className="bar"></div>
                          <div className="bar"></div>
                          <div className="bar"></div>
                          <div className="bar"></div>
                        </div> : 
                        <div style={{ zIndex: 1, color: selectedTrack && selectedTrack.id === track.id ? '#FFCC44' : 'initial' }}>{index + 1}</div>
                      }
                      <button
                        style={{ position: 'absolute', top: 0, left: 0, opacity: 0, zIndex: 2 }}
                        onClick={() => handlePlayPause(track)}
                      >
                        {playingTrack && playingTrack.id === track.id && isPlaying ? <IoIosPause /> : <IoIosPlay />}
                      </button>
                    </div>
                  </div>
                </td>
                <td style={{ color: selectedTrack && selectedTrack.id === track.id ? '#FFCC44' : 'initial' }}>{track.title}</td>
                <td style={styles.tdata}>{track.genre}</td>
                <td style={styles.tdata}>{track.bpm}</td>
                <td style={styles.tdata}>{track.mood}</td>
                <td style={styles.tdata}>
                  <button onClick={() => handleDelete(track.id)}><IoIosTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        message="Are you sure you want to delete this track?"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default TrackList;