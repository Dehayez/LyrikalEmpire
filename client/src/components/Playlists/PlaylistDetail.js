import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { getPlaylistById, getBeatsByPlaylistId, removeBeatFromPlaylist } from '../../services/playlistService';
import { eventBus } from '../../utils';
import { BeatList } from '../BeatList';
import { UpdatePlaylistForm } from './UpdatePlaylistForm'; 
import classNames from 'classnames';
import './PlaylistDetail.scss';

const PlaylistDetail = ({ onPlay, selectedBeat, isPlaying, handleQueueUpdateAfterDelete, currentBeat, onSort, sortedBeats, sortConfig, addToCustomQueue, onBeatClick, onUpdateBeat, onUpdate }) => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [beats, setBeats] = useState([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      const playlistData = await getPlaylistById(id);
      setPlaylist(playlistData);
      const beatsData = await getBeatsByPlaylistId(id);
      setBeats(beatsData);
    };
  
    fetchPlaylistDetails();
  }, [id]);

  const handleUpdateBeat = (beatId, updatedFields) => {
    setBeats((prevBeats) =>
      prevBeats.map((beat) =>
        beat.id === beatId ? { ...beat, ...updatedFields } : beat
      )
    );
  };

  useEffect(() => {
    const updatePlaylistDetails = (updatedPlaylist) => {
      if (updatedPlaylist.id === playlist?.id) {
        setPlaylist({ ...playlist, title: updatedPlaylist.title, description: updatedPlaylist.description });
      }
    };
  
    eventBus.on('playlistUpdated', updatePlaylistDetails);
  
    return () => {
      eventBus.off('playlistUpdated', updatePlaylistDetails);
    };
  }, [playlist]);

  const sortBeats = (beats, sortConfig) => {
    if (!sortConfig || !sortConfig.key) {
      return [...beats].sort((a, b) => a.beat_order - b.beat_order);
    }
  
    return [...beats].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  };

  const handleHeaderClick = () => {
    setShowUpdateForm(true);
  };

  const refreshPlaylist = async () => {
    const updatedPlaylist = await getPlaylistById(id);
    setPlaylist(updatedPlaylist);
    const updatedBeats = await getBeatsByPlaylistId(id);
    setBeats(updatedBeats);
  };

  const handleDeleteBeats = async (beatIds) => {
    try {
      const ids = Array.isArray(beatIds) ? beatIds : [beatIds];
      await Promise.all(ids.map(beatId => removeBeatFromPlaylist(id, beatId)));
      await refreshPlaylist();
    } catch (error) {
      console.error('Error deleting beats from playlist:', error);
    }
  };

  return (
    <>
      {playlist && (
        <div className='playlist'>
          <div className='playlist__beats'>
              <BeatList
                key={beats.length}
                externalBeats={sortBeats(beats, sortConfig)}
                shouldFetchBeats={false}
                onPlay={onPlay}
                selectedBeat={selectedBeat}
                isPlaying={isPlaying}
                handleQueueUpdateAfterDelete={handleQueueUpdateAfterDelete}
                currentBeat={currentBeat}
                sortedBeats={sortedBeats}
                onSort={onSort}
                sortConfig={sortConfig}
                addToCustomQueue={addToCustomQueue}
                onBeatClick={onBeatClick}
                deleteMode='playlist'
                playlistName={playlist.title}
                playlistId={playlist.id}
                onDeleteFromPlaylist={handleDeleteBeats}
                onUpdateBeat={handleUpdateBeat}
                onUpdate={onUpdate}
                headerContent={
                  <div className='playlist__text' onClick={handleHeaderClick}>
                    <h2 className='playlist__title'>{playlist.title}</h2>
                    <p className={classNames('playlist__description', { 'has-description': playlist.description })}>
                      {playlist.description}
                    </p>
                  </div>
                }
              />
          </div>
        </div>
      )}
      {showUpdateForm && ReactDOM.createPortal(
        <UpdatePlaylistForm
          playlist={playlist}
          onClose={() => setShowUpdateForm(false)}
          onUpdated={refreshPlaylist}
        />,
        document.getElementById('modal-root')
      )}
    </>
  );
};

export default PlaylistDetail;