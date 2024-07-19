import React, { useEffect, useState } from 'react';
import { getPlaylists, createPlaylist } from '../../services/playlistService';
import { IoAddSharp } from "react-icons/io5";
import './Playlists.scss';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);

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
      await createPlaylist({ title: newPlaylistTitle, description: 'Automatically generated playlist' });
      await fetchPlaylists();
    } catch (error) {
      console.error('Error adding new playlist:', error);
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
      <ul>
        {playlists.map(playlist => (
          <li key={playlist.id}>{playlist.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Playlists;