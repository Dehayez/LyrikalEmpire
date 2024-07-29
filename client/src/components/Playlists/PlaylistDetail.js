import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import classNames from 'classnames';

import { getPlaylistById, getBeatsByPlaylistId, removeBeatFromPlaylist, updateBeatOrder } from '../../services';
import { eventBus, sortBeats } from '../../utils';
import { BeatList } from '../BeatList';
import { UpdatePlaylistForm } from './UpdatePlaylistForm'; 

import './PlaylistDetail.scss';

const PlaylistDetail = ({ onPlay, selectedBeat, isPlaying, handleQueueUpdateAfterDelete, currentBeat, onSort, sortedBeats, sortConfig, addToCustomQueue, onBeatClick, onUpdateBeat, onUpdate }) => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [beats, setBeats] = useState([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const refreshPlaylist = async () => {
    const updatedPlaylist = await getPlaylistById(id);
    setPlaylist(updatedPlaylist);
    const updatedBeats = await getBeatsByPlaylistId(id);
    setBeats(updatedBeats);
  };

  const moveBeat = useCallback((dragIndex, hoverIndex) => {
    const dragBeat = beats[dragIndex];
    const updatedBeats = [...beats];
    updatedBeats.splice(dragIndex, 1);
    updatedBeats.splice(hoverIndex, 0, dragBeat);

    setBeats(updatedBeats);
    updateBeatOrder(id, updatedBeats.map((beat, index) => ({ id: beat.id, order: index + 1 })));
  }, [beats, id]);

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        const playlistData = await getPlaylistById(id);
        setPlaylist(playlistData);
        
        const beatsData = await getBeatsByPlaylistId(id);
        const sortedBeats = beatsData.sort((a, b) => a.beat_order - b.beat_order);
        setBeats(sortedBeats);
      } catch (error) {
        console.error('Error fetching playlist details:', error);
      }
    };
  
    fetchPlaylistDetails();
  }, [id]);

  const handleUpdateBeat = (beatId, updatedFields) => {
    setBeats((prevBeats) => {
      const updatedBeats = prevBeats.map((beat) =>
        beat.id === beatId ? { ...beat, ...updatedFields } : beat
      );
      return updatedBeats.sort((a, b) => a.beat_order - b.beat_order);
    });
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

  const handleHeaderClick = () => {
    setShowUpdateForm(true);
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
            <DndProvider backend={HTML5Backend}>
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
                  moveBeat={moveBeat}
                  setBeats={setBeats}
                  headerContent={
                    <div className='playlist__text' onClick={handleHeaderClick}>
                      <h2 className='playlist__title'>{playlist.title}</h2>
                      <p className={classNames('playlist__description', { 'has-description': playlist.description })}>
                        {playlist.description}
                      </p>
                    </div>
                  }
                />
            </DndProvider>
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