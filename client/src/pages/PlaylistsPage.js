import React from 'react';
import { usePlaylist } from '../contexts';

const PlaylistsPage = () => {
  const { playlists } = usePlaylist();

  return (
    <div>
      <h1>All Playlists</h1>
      <ul>
        {playlists.map((playlist) => (
          <li key={playlist.id}>{playlist.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistsPage;