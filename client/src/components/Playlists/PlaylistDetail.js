import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { getPlaylistById } from '../../services/playlistService';
import { UpdatePlaylistForm } from './UpdatePlaylistForm'; 
import './PlaylistDetail.scss';

const PlaylistDetail = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  useEffect(() => {
    const fetchPlaylist = async () => {
      const data = await getPlaylistById(id);
      setPlaylist(data);
    };

    fetchPlaylist();
  }, [id]);

  const handleHeaderClick = () => {
    setShowUpdateForm(true);
  };

  const refreshPlaylist = async () => {
    const updatedPlaylist = await getPlaylistById(id);
    setPlaylist(updatedPlaylist);
  };

  return (
    <>
      {playlist && (
        <div className='playlist'>
          <div className='playlist__header' onClick={handleHeaderClick}>
            <h2 className='playlist__title'>{playlist.title}</h2>
            <p className='playlist__description'>{playlist.description}</p>
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