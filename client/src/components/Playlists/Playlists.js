import React, { useEffect, useState } from 'react';
import { getPlaylists, createPlaylist } from '../../services/playlistService';
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
      await fetchPlaylists(); // Refresh the playlists to include the new one
    } catch (error) {
      console.error('Error adding new playlist:', error);
    }
  };

  return (
    <div className="playlists">
      <h2 className="playlists__title">Playlists</h2>
      <button onClick={handleAddPlaylist}>Add New Playlist</button>
      <ul>
        {playlists.map(playlist => (
          <li key={playlist.id}>{playlist.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Playlists;