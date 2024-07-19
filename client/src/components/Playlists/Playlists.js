import React, { useEffect, useState } from 'react';
import { getPlaylists, createPlaylist, deletePlaylist } from '../../services/playlistService';
import { ContextMenu } from '../ContextMenu';
import { IoAddSharp, IoRemoveCircleOutline } from "react-icons/io5";
import './Playlists.scss';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);
  const [hoveredBeat, setHoveredBeat] = useState(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const data = await getPlaylists();
      setPlaylists(data);
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
    } catch (error) {
      console.error(`Error deleting playlist with ID ${playlistId}:`, error);
    }
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

  const handleRightClick = (e, beat, index) => {
    e.preventDefault();
    const historyListElement = document.querySelector('.playlists__list');
  
    if (historyListElement) {
      const { left, top } = historyListElement.getBoundingClientRect();
      setActiveContextMenu(`${beat.id}-${index}`);
      setContextMenuX(e.clientX - left + 16);
      setContextMenuY(e.clientY - top + 84);
    }
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
            className='playlists__list-item' 
            key={index}
            onContextMenu={(e) => handleRightClick(e, playlist, index)}
          >
            {playlist.title}

            {activeContextMenu === `${playlist.id}-${index}` && (
                  <ContextMenu
                    beat={playlist}
                    position={{ top: contextMenuY, left: contextMenuX }}
                    setActiveContextMenu={setActiveContextMenu}
                    items={[
                      {
                        icon: IoAddSharp,
                        iconClass: 'add-playlist',
                        text: 'Add to playlist',
                        buttonClass: 'add-playlist',
                        onClick: () => console.log(`Add ${playlist.id} to playlist clicked`),
                      },
                      {
                        icon: IoRemoveCircleOutline,
                        iconClass: 'delete-playlist',
                        text: 'Delete',
                        buttonClass: 'delete-playlist',
                        onClick: () => handleDeletePlaylist(playlist.id),
                      }
                    ]}
                  />
                )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Playlists;