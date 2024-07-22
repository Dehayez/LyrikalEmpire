import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { getPlaylistById, getBeatsByPlaylistId } from '../../services/playlistService';
import { BeatList } from '../BeatList';
import { UpdatePlaylistForm } from './UpdatePlaylistForm'; 
import './PlaylistDetail.scss';

const PlaylistDetail = ({ onPlay, selectedBeat, isPlaying, handleQueueUpdateAfterDelete, currentBeat, onSort, sortedBeats, sortConfig, addToCustomQueue, onBeatClick }) => {
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

  const handleHeaderClick = () => {
    setShowUpdateForm(true);
  };

  const refreshPlaylist = async () => {
    const updatedPlaylist = await getPlaylistById(id);
    setPlaylist(updatedPlaylist);
    const updatedBeats = await getBeatsByPlaylistId(id);
    setBeats(updatedBeats);
  };

  return (
    <>
      {playlist && (
        <div className='playlist'>
          <div className='playlist__beats'>
              <BeatList
                key={beats.length}
                title={playlist.title}
                externalBeats={beats}
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
                headerContent={
                  <div className='playlist__text' onClick={handleHeaderClick}>
                    <h2 className='playlist__title'>{playlist.title}</h2>
                    <p className='playlist__description'>{playlist.description}</p>
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