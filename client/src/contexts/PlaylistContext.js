import React, { createContext, useContext, useState } from 'react';

const PlaylistContext = createContext();

export const usePlaylist = () => useContext(PlaylistContext);

export const PlaylistProvider = ({ children }) => {
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);

  const setPlaylistId = (id) => {
    setCurrentPlaylistId(id);
  };

  return (
    <PlaylistContext.Provider value={{ currentPlaylistId, setPlaylistId }}>
      {children}
    </PlaylistContext.Provider>
  );
};