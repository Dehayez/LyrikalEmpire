import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactDOM from 'react-dom'; // Step 1: Import ReactDOM
import { getPlaylistById } from '../../services/playlistService';
import { UpdatePlaylistForm } from './UpdatePlaylistForm'; // Step 1: Import UpdatePlaylistForm

const PlaylistDetail = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Step 2: Add state for update form visibility

  useEffect(() => {
    const fetchPlaylist = async () => {
      const data = await getPlaylistById(id);
      setPlaylist(data);
    };

    fetchPlaylist();
  }, [id]);

  const handleHeaderClick = () => { // Step 3: Add click event handler
    setShowUpdateForm(true);
  };

  return (
    <>
      {playlist && (
        <div className='playlist'>
          <div className='playlist__header' onClick={handleHeaderClick}> {/* Step 3: Attach click event handler */}
            <h2 className='playlist__title'>{playlist.title}</h2>
            <p className='playlist__description'>{playlist.description}</p>
          </div>
        </div>
      )}
      {showUpdateForm && ReactDOM.createPortal( // Step 4: Use ReactDOM.createPortal
        <UpdatePlaylistForm
          playlist={playlist}
          onClose={() => setShowUpdateForm(false)}
          onUpdated={() => {} /* Define how to handle update here */}
        />,
        document.getElementById('modal-root')
      )}
    </>
  );
};

export default PlaylistDetail;