import React, { useState } from 'react';
import { updatePlaylist } from '../../services/playlistService';
import { FormInput, FormTextarea } from '../Inputs';
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
        <>
            <div className="update-playlist__overlay" onClick={onClose}>
                <div className="update-playlist__form" onClick={(e) => e.stopPropagation()}>
                    <h2 className='update-playlist__title'>Edit details</h2>
                    <FormInput label="Title" type="text" placeholder='Enter name' value={title} onChange={(e) => setTitle(e.target.value)} spellCheck="false" />
                    <FormTextarea label="Description" type="text" placeholder='Enter description' value={description} onChange={(e) => setDescription(e.target.value)} spellCheck="false" />
                    <div className="update-playlist__buttons">
                        <button className="update-playlist__button update-playlist__button--update" onClick={handleUpdate}>Save</button>
                        <button className="update-playlist__button update-playlist__button--cancel" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </>
    );
  };