import React from 'react';
import { useBeat, usePlaylist, useData } from '../contexts';
import { StatCard, StatChart } from '../components';
import './DashboardPage.scss';

const DashboardPage = () => {
  const { allBeats } = useBeat();
  const { playlists } = usePlaylist();
  const { genres, moods, keywords, features } = useData();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <StatChart />
      <div className="stats">
        <StatCard size="large" title="Total Beats" value={allBeats.length} link="/dashboard/beats" />
        <StatCard size="large" title="Total Playlists" value={playlists.length} link="/dashboard/playlists" />
        <StatCard size="small" title="Total Genres" value={genres.length} link="/dashboard/genres" />
        <StatCard size="small" title="Total Moods" value={moods.length} link="/dashboard/moods" />
        <StatCard size="small" title="Total Keywords" value={keywords.length} link="/dashboard/keywords" />
        <StatCard size="small" title="Total Features" value={features.length} link="/dashboard/features" />
      </div>
    </div>
  );
};

export default DashboardPage;