import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PlaylistContext = createContext();

export const usePlaylist = () => useContext(PlaylistContext);

export const PlaylistProvider = ({ children }) => {
  const [playedPlaylistId, setPlayedPlaylistId] = useState(() => {
    return localStorage.getItem('playedPlaylistId');
  });
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
  const [isSamePlaylist, setIsSamePlaylist] = useState(false);
  const location = useLocation();

  function setPlaylistId(id) {
    setPlayedPlaylistId(id);
  }

  useEffect(() => {
    setIsSamePlaylist(playedPlaylistId === currentPlaylistId);
  }, [playedPlaylistId, currentPlaylistId]);

  useEffect(() => {
    if (playedPlaylistId) {
      localStorage.setItem('playedPlaylistId', playedPlaylistId);
    } else {
      localStorage.removeItem('playedPlaylistId');
    }
  }, [playedPlaylistId]);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const playlistId = pathParts[pathParts.length - 1];
    setCurrentPlaylistId(playlistId ? playlistId : null);
  }, [location]);

  return (
    <PlaylistContext.Provider value={{ playedPlaylistId, setPlaylistId, currentPlaylistId, isSamePlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
};