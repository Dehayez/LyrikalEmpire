import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getPlaylists, createPlaylist, deletePlaylist } from '../../services/playlistService';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { eventBus } from '../../utils';
import { ContextMenu } from '../ContextMenu';
import { UpdatePlaylistForm } from './UpdatePlaylistForm';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { IoAddSharp, IoRemoveCircleOutline, IoPencil, IoVolumeMediumSharp } from "react-icons/io5";
import './Playlists.scss';

const Playlists = ({ isPlaying }) => {
  const navigate = useNavigate();
  const { playedPlaylistId, currentPlaylistId } = usePlaylist();

  const [playlists, setPlaylists] = useState([]);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);

  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  useEffect(() => {
    const toggleScroll = (disable) => document.body.classList.toggle('no-scroll', disable);
    const hideContextMenu = () => setActiveContextMenu(null);

    const manageContextMenuVisibility = (show) => {
      window[`${show ? 'add' : 'remove'}EventListener`]('click', hideContextMenu);
      toggleScroll(show);
    };

    manageContextMenuVisibility(!!activeContextMenu);

    return () => manageContextMenuVisibility(false);
  }, [activeContextMenu]);

  useEffect(() => {
    const updatePlaylistDetails = (updatedPlaylist) => {
      setPlaylists(currentPlaylists =>
        currentPlaylists.map(playlist =>
          playlist.id === updatedPlaylist.id
            ? { ...playlist, title: updatedPlaylist.title, description: updatedPlaylist.description }
            : playlist
        )
      );
    };
  
    eventBus.on('playlistUpdated', updatePlaylistDetails);
  
    return () => {
      eventBus.off('playlistUpdated', updatePlaylistDetails);
    };
  }, [playlists]);
  

  const fetchPlaylists = async () => {
    try {
      const data = await getPlaylists();
      const sortedData = data.sort((a, b) => b.id - a.id);
      setPlaylists(sortedData);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handleAddPlaylist = async () => {
    const newPlaylistTitle = `Playlist #${playlists.length + 1}`;
    try {
      await createPlaylist({ title: newPlaylistTitle, description: null });
      await fetchPlaylists();
    } catch (error) {
      console.error('Error adding new playlist:', error);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await deletePlaylist(playlistId);
      await fetchPlaylists();
      setShowConfirmModal(false);
    } catch (error) {
      console.error(`Error deleting playlist with ID ${playlistId}:`, error);
    }
  };

  const handleOpenUpdateForm = (playlist) => {
    setShowUpdateForm(true);
  };

  const handleLeftClick = (playlistId) => {
    navigate(`/playlists/${playlistId}`);
  };

  const handleRightClick = (e, playlist, index) => {
    e.preventDefault();
    const historyListElement = document.querySelector('.playlists__list');
  
    if (historyListElement) {
      const { left, top } = historyListElement.getBoundingClientRect();
      setActiveContextMenu(`${playlist.id}-${index}`);
      setContextMenuX(e.clientX - left + 16);
      setContextMenuY(e.clientY - top + 84);
    }
  };

  const openConfirmModal = (playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) {
      console.error('Playlist not found:', playlistId);
      return;
    }
    setPlaylistToDelete(playlist);
    setShowConfirmModal(true);
  };

  return (
    <div className="playlists">
      <div className="playlists__header">
        <h2 className="playlists__title">Playlists</h2>
        <button className='icon-button' onClick={handleAddPlaylist}>
        <span className="tooltip tooltip--left">Add playlist</span>
          <IoAddSharp />
        </button>
      </div>
      <ul className='playlists__list'>
        {playlists.map((playlist, index) => (
          <li 
            key={index} 
            className={`playlists__list-item${playedPlaylistId === playlist.id ? ' playlists__list-item--playing' : ''}${playlist.id == currentPlaylistId ? ' playlists__list-item--active' : ''}`}
            onClick={() => {handleLeftClick(playlist.id);}}
            onContextMenu={(e) => handleRightClick(e, playlist, index)}
            style={{ textDecoration: 'none' }}
          >
            <div>{playlist.title}</div>
           {playedPlaylistId === playlist.id && isPlaying && <IoVolumeMediumSharp/>}

            {activeContextMenu === `${playlist.id}-${index}` && (
              <ContextMenu
                beat={playlist}
                position={{ top: contextMenuY, left: contextMenuX }}
                setActiveContextMenu={setActiveContextMenu}
                items={[
                  {
                    icon: IoRemoveCircleOutline,
                    iconClass: 'delete-playlist',
                    text: 'Delete playlist',
                    buttonClass: 'delete-playlist',
                    onClick: () => openConfirmModal(playlist.id),
                  },
                  {
                    icon: IoPencil,
                    iconClass: 'edit-playlist',
                    text: 'Edit details',
                    buttonClass: 'edit-playlist',
                    onClick: () => handleOpenUpdateForm(playlist),
                  }
                ]}
              />
            )}
          </li>
        ))}
      </ul>
      {showUpdateForm && currentPlaylistId && ReactDOM.createPortal(
        <UpdatePlaylistForm
          playlist={currentPlaylistId}
          onClose={() => setShowUpdateForm(false)}
          onUpdated={fetchPlaylists}
        />,
        document.getElementById('modal-root')
      )}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Delete playlist"
        message={<span>Are you sure you want to delete <strong>{playlistToDelete?.title}</strong>?</span>}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        onConfirm={() => handleDeletePlaylist(playlistToDelete?.id)}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default Playlists;