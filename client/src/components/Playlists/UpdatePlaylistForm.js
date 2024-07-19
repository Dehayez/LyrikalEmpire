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
        <div className='update-playlist'>
            <div className="update-playlist__overlay" onClick={onClose}>
                <div className="update-playlist__form" onClick={(e) => e.stopPropagation()}>
                    <input type="text" className="update-playlist__input update-playlist__input--title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                    <textarea className="update-playlist__textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"></textarea>
                    <button className="update-playlist__button update-playlist__button--update" onClick={handleUpdate}>Update</button>
                    <button className="update-playlist__button update-playlist__button--cancel" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
  };