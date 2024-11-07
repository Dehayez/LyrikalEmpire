import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { eventBus } from '../utils';
import { getPlaylists } from '../services';
import { useUser } from '../contexts';

const PlaylistContext = createContext();

export const usePlaylist = () => useContext(PlaylistContext);

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);
  const [playedPlaylistId, setPlayedPlaylistId] = useState(() => {return localStorage.getItem('playedPlaylistId');
});
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
  const [isSamePlaylist, setIsSamePlaylist] = useState(false);
  const location = useLocation();
  const { user } = useUser();

  const setPlaylistId = (id) => {
    setPlayedPlaylistId(id);
  };

  const updatePlaylist = (updatedPlaylist) => {
    setPlaylists((prevPlaylists) => {
      return prevPlaylists.map((playlist) =>
        playlist.id === updatedPlaylist.id ? updatedPlaylist : playlist
      );
    });
  };

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

  useEffect(() => {
    setIsSamePlaylist(playedPlaylistId == currentPlaylistId);
  }, [playedPlaylistId, currentPlaylistId]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await getPlaylists(user.id);
        setPlaylists(data);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    if (user.id) {
      fetchPlaylists();
    }

    const handlePlaylistAdded = () => {
      fetchPlaylists();
    };

    const handlePlaylistDeleted = () => {
      fetchPlaylists();
    };

    const handlePlaylistUpdated = (updatedPlaylist) => {
      setPlaylists((currentPlaylists) =>
        currentPlaylists.map((playlist) =>
          playlist.id === updatedPlaylist.id
            ? { ...playlist, title: updatedPlaylist.title, description: updatedPlaylist.description }
            : playlist
        )
      );
    };

    eventBus.on('playlistAdded', handlePlaylistAdded);
    eventBus.on('playlistDeleted', handlePlaylistDeleted);
    eventBus.on('playlistUpdated', handlePlaylistUpdated);

    return () => {
      eventBus.off('playlistAdded', handlePlaylistAdded);
      eventBus.off('playlistDeleted', handlePlaylistDeleted);
      eventBus.off('playlistUpdated', handlePlaylistUpdated);
    };
  }, [user.id]);

  return (
    <PlaylistContext.Provider value={{ playedPlaylistId, setPlaylistId, currentPlaylistId, isSamePlaylist, playlists, updatePlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
};