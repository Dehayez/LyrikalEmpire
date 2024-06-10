import React, { useState, useEffect } from 'react';
import { getTracks, deleteTrack } from '../services/trackService';
import ConfirmDialog from './ConfirmDialog';
import { IoIosPause, IoIosPlay, IoIosTrash } from "react-icons/io";
import './TrackList.css';

const TrackList = ({ onPlay, isPlaying }) => {
  const [tracks, setTracks] = useState([]);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState(null);
  const [playingTrack, setPlayingTrack] = useState(null);

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

  const handlePlayPause = (track) => {
    if (playingTrack && playingTrack.id === track.id) {
      setPlayingTrack(null);
      onPlay(track, !isPlaying);
    } else {
      setPlayingTrack(track);
      onPlay(track, true);
    }
  };

  const styles = {
    tableContainer: {
      overflowX: 'auto',
    },
    table: {
      minWidth: '600px',
      width: '100%',
      tableLayout: 'auto',
    },
    thead: {
      position: 'sticky',
      top: 0,
      backgroundColor: '#fff',
      textAlign: 'left',
    },
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
            {tracks.map((track, index) => {
              return (
                <tr className="track-row" key={track.id}
                onMouseEnter={(e) => e.currentTarget.querySelector('button').style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.querySelector('button').style.opacity = 0}>
                  <td>
                    <div style={{position: 'relative'}}>
                      <div style={{zIndex: 1}}>{index + 1}</div>
                      <button style={{position: 'absolute', top: 0, left: 0, opacity: 0, zIndex: 2}} 
                              onClick={() => handlePlayPause(track)}>
                        {playingTrack && playingTrack.id === track.id && isPlaying ? <IoIosPause /> : <IoIosPlay />}
                      </button>
                    </div>
                  </td>
                  <td>{track.title}</td>
                  <td>{track.genre}</td>
                  <td>{track.bpm}</td>
                  <td>{track.mood}</td>
                  <td>
                    <button onClick={() => handleDelete(track.id)}><IoIosTrash /></button>
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