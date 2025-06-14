import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAddSharp, IoRemoveCircleOutline, IoPencil, IoVolumeMediumSharp } from "react-icons/io5";

import { usePlaylist } from '../../contexts/PlaylistContext';
import { eventBus, isMobileOrTablet } from '../../utils';
import { getPlaylistById, deletePlaylist } from '../../services';

import { Button, IconButton } from '../Buttons';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { ContextMenu } from '../ContextMenu';
import { UpdatePlaylistForm } from './UpdatePlaylistForm';

import './Playlists.scss';

const Playlists = ({ isPlaying, closeSidePanel, toggleSidePanel }) => {
  const navigate = useNavigate();
  const { playlists, playedPlaylistId, currentPlaylistId, updatePlaylist, handleAddPlaylist } = usePlaylist();

  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);

  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  
  const [playlistToUpdate, setPlaylistToUpdate] = useState(null);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await deletePlaylist(playlistId);
      setIsOpenDelete(false);
      eventBus.emit('playlistDeleted', playlistId);
    } catch (error) {
      console.error(`Error deleting playlist with ID ${playlistId}:`, error);
    }
  };

  const handleOpenUpdateForm = (playlist) => {
    setPlaylistToUpdate(playlist);
    setIsOpenUpdate(true);
  };
  
  const refreshPlaylist = async (playlistId) => {
    const updatedPlaylist = await getPlaylistById(playlistId);
    updatePlaylist(updatedPlaylist);
  };

  const handleLeftClick = (playlistId) => {
    if (!isMobileOrTablet) {
      closeSidePanel('left');
    }
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

  const playListClick = (playlistId) => {
    if (isMobileOrTablet()) {
      console.log('Mobile or tablet detected, not closing side panel');
      toggleSidePanel('left');
    }
    handleLeftClick(playlistId);
  };

  const openConfirmModal = (playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) {
      console.error('Playlist not found:', playlistId);
      return;
    }
    setPlaylistToDelete(playlist);
    setIsOpenDelete(true);
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
      <div className="playlists__header-left">
        <h2 className="playlists__title">Playlists</h2>
      </div>
        <IconButton
          className="icon-button"
          onClick={() => handleAddPlaylist(`Playlist #${playlists.length + 1}`, null)}
          text="Add playlist"
          tooltipPosition="left"
        >
          <IoAddSharp />
        </IconButton>
      </div>
      {playlists.length === 0 ? (
        <div className="playlists__empty-message">
          <p>Your playlist is empty. Create a new playlist to get started!</p>
          <Button text="Create New Playlist" variant="primary" onClick={() => handleAddPlaylist(`Playlist #${playlists.length + 1}`, null)} />
        </div>
      ) : (
      <ul className='playlists__list'>
        {playlists.map((playlist, index) => (
          <li 
            key={index} 
            className={`playlists__list-item${playedPlaylistId === playlist.id ? ' playlists__list-item--playing' : ''}${playlist.id === currentPlaylistId ? ' playlists__list-item--active' : ''}`}
            onClick={() => playListClick(playlist.id)}
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
      {playlistToUpdate && (
        <UpdatePlaylistForm
          playlist={playlistToUpdate}
          isOpen={isOpenUpdate}
          setIsOpen={setIsOpenUpdate}
          onConfirm={() => refreshPlaylist(playlistToUpdate.id)}
          onCancel={() => setIsOpenUpdate(false)}
        />
      )}
      {isOpenDelete && 
        <ConfirmModal
          isOpen={isOpenDelete}
          isSetOpen={setIsOpenDelete}
          title="Delete playlist"
          message={<span>Are you sure you want to delete <strong>{playlistToDelete?.title}</strong>?</span>}
          confirmButtonText="Delete"
          cancelButtonText="Cancel"
          onConfirm={() => handleDeletePlaylist(playlistToDelete?.id)}
          onCancel={() => setIsOpenDelete(false)}
        />
      }
    </div>
  );
};

export default Playlists;