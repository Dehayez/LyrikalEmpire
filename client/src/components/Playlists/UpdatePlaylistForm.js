import React, { useState } from 'react';
import { updatePlaylist } from '../../services/playlistService';
import './UpdatePlaylistForm.scss';

export const UpdatePlaylistForm = ({ playlist, onClose, onUpdated }) => {
    const [title, setTitle] = useState(playlist.title);
    const [description, setDescription] = useState(playlist.description || '');
  
    const handleUpdate = async () => {
      try {
        await updatePlaylist(playlist.id, { title, description });
        onUpdated();
        onClose();
      } catch (error) {
        console.error('Error updating playlist:', error);
      }
    };
  
    return (
        <div className="update-playlist-overlay">
        <div className="update-playlist-form">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"></textarea>
          <button onClick={handleUpdate}>Update</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  };