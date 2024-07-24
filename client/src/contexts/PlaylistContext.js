import React, { createContext, useContext, useEffect, useState } from 'react';

const PlaylistContext = createContext();

export const usePlaylist = () => useContext(PlaylistContext);

export const PlaylistProvider = ({ children }) => {
  const [currentPlaylistId, setCurrentPlaylistId] = useState(() => {
    return localStorage.getItem('currentPlaylistId');
  });

  const setPlaylistId = (id) => {
    setCurrentPlaylistId(id);
  };

  useEffect(() => {
    if (currentPlaylistId) {
      localStorage.setItem('currentPlaylistId', currentPlaylistId);
    } else {
      localStorage.removeItem('currentPlaylistId');
    }
  }, [currentPlaylistId]);

  return (
    <PlaylistContext.Provider value={{ currentPlaylistId, setPlaylistId }}>
      {children}
    </PlaylistContext.Provider>
  );
};