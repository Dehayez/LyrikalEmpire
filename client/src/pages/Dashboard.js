import React from 'react';
import { useBeat, usePlaylist, useData } from '../contexts';
import { StatCard } from '../components';
import './Dashboard.scss';

const Dashboard = () => {
  const { allBeats } = useBeat();
  const { playlists } = usePlaylist();
  const { genres, moods, keywords, features } = useData();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats">
        <StatCard size="large" title="Total Beats" value={allBeats.length} />
        <StatCard size="large" title="Total Playlists" value={playlists.length} />
        <StatCard size="small" title="Total Genres" value={genres.length} />
        <StatCard size="small" title="Total Moods" value={moods.length} />
        <StatCard size="small" title="Total Keywords" value={keywords.length} />
        <StatCard size="small" title="Total Features" value={features.length} />
      </div>
    </div>
  );
};

export default Dashboard;