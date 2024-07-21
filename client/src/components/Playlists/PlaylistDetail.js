import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPlaylistById } from '../../services/playlistService';

const PlaylistDetail = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    console.log(playlist)
  }, [playlist]);

  useEffect(() => {
    const fetchPlaylist = async () => {
      const data = await getPlaylistById(id);
      setPlaylist(data);
    };

    fetchPlaylist();
  }, [id]);

  if (!playlist) return <div>Loading...</div>;

  return (
    <div>
      <h2>{playlist.title}</h2>
    </div>
  );
};

export default PlaylistDetail;