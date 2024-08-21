import React from 'react';
import { usePlaylist } from '../contexts';
import '../globals/pageStyles.scss';

const PlaylistsPage = () => {
  const { playlists } = usePlaylist();

  return (
    <div>
      <h1 className="page-title">All Playlists</h1>
      <ul className="page-list">
        {playlists.map((playlist) => (
          <li key={playlist.id} className="page-list-item">{playlist.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistsPage;