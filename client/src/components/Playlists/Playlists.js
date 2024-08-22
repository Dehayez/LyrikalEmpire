import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { IoAddSharp, IoRemoveCircleOutline, IoPencil, IoVolumeMediumSharp } from "react-icons/io5";

import { usePlaylist } from '../../contexts/PlaylistContext';
import { eventBus } from '../../utils';
import { createPlaylist, deletePlaylist } from '../../services';

import { ContextMenu } from '../ContextMenu';
import { UpdatePlaylistForm } from './UpdatePlaylistForm';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import Button from '../Buttons';
import { Tooltip } from '../Tooltip';

import './Playlists.scss';

const Playlists = ({ isPlaying }) => {
  const navigate = useNavigate();
  const { playlists, playedPlaylistId, currentPlaylistId } = usePlaylist();

  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [playlistToUpdate, setPlaylistToUpdate] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  const handleAddPlaylist = async () => {
    const newPlaylistTitle = `Playlist #${playlists.length + 1}`;
    try {
      await createPlaylist({ title: newPlaylistTitle, description: null });
      eventBus.emit('playlistAdded');
    } catch (error) {
      console.error('Error adding new playlist:', error);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await deletePlaylist(playlistId);
      setShowConfirmModal(false);
      eventBus.emit('playlistDeleted', playlistId);
    } catch (error) {
      console.error(`Error deleting playlist with ID ${playlistId}:`, error);
    }
  };

  const handleOpenUpdateForm = (playlist) => {
    setPlaylistToUpdate(playlist);
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

  return (
    <div className="playlists">
      <div className="playlists__header">
        <h2 className="playlists__title">Playlists</h2>
        <button className='icon-button' onClick={handleAddPlaylist}>
          <Tooltip text="Add playlist" position='left' />
          <IoAddSharp />
        </button>
      </div>
      {playlists.length === 0 ? (
        <div className="playlists__empty-message">
          <p>Your playlist is empty. Create a new playlist to get started!</p>
          <Button text="Create New Playlist" onClick={handleAddPlaylist} />
        </div>
      ) : (
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
      </ul>)}
      {showUpdateForm && playlistToUpdate && ReactDOM.createPortal(
        <UpdatePlaylistForm
          playlist={playlistToUpdate}
          onClose={() => setShowUpdateForm(false)}
          onUpdated={() => setShowUpdateForm(false)}
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