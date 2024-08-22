import React, { useState } from 'react';
import { useBeat, usePlaylist, useData } from '../contexts';
import { StatCard, StatChart } from '../components';
import './DashboardPage.scss';

const DashboardPage = () => {
  const { allBeats } = useBeat();
  const { playlists } = usePlaylist();
  const { genres, moods, keywords, features } = useData();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const handleMouseEnter = (card) => {
    setIsCardHovered(true);
    setHoveredCard(card);
  };

  const handleMouseLeave = () => {
    setIsCardHovered(false);
    setHoveredCard(null);
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <StatChart hoveredCard={hoveredCard} isCardHovered={isCardHovered} />
      <div className="stats">
        <StatCard size="large" title="Total Beats" value={allBeats.length} link="/dashboard/beats" onMouseEnter={() => handleMouseEnter('beats')} onMouseLeave={handleMouseLeave} />
        <StatCard size="large" title="Total Playlists" value={playlists.length} link="/dashboard/playlists" onMouseEnter={() => handleMouseEnter('playlists')} onMouseLeave={handleMouseLeave} />
        <StatCard size="small" title="Total Genres" value={genres.length} link="/dashboard/genres" onMouseEnter={() => handleMouseEnter('genres')} onMouseLeave={handleMouseLeave} />
        <StatCard size="small" title="Total Moods" value={moods.length} link="/dashboard/moods" onMouseEnter={() => handleMouseEnter('moods')} onMouseLeave={handleMouseLeave} />
        <StatCard size="small" title="Total Keywords" value={keywords.length} link="/dashboard/keywords" onMouseEnter={() => handleMouseEnter('keywords')} onMouseLeave={handleMouseLeave} />
        <StatCard size="small" title="Total Features" value={features.length} link="/dashboard/features" onMouseEnter={() => handleMouseEnter('features')} onMouseLeave={handleMouseLeave} />
      </div>
    </div>
  );
};

export default DashboardPage;