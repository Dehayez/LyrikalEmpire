import React from 'react';
import { usePlaylist } from '../contexts';
import { StatCard, StatChart } from '../components';

import '../globals/pageStyles.scss';

const PlaylistsPage = () => {
  const { playlists } = usePlaylist();

  return (
    <div className="page">
      <h1 className="page-title">Playlists</h1>
      <StatCard size="full-width">
        <StatChart filterOption="playlists" />
      </StatCard>
      <ul className="page-list">
        {playlists.map((playlist) => (
          <li key={playlist.id} className="page-list-item">{playlist.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistsPage;