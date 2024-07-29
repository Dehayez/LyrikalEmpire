import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';

import { FormInput, FormTextarea } from '../Inputs';
import { Warning } from '../Warning';
import { updatePlaylist } from '../../services';
import { eventBus } from '../../utils';

import './UpdatePlaylistForm.scss';

export const UpdatePlaylistForm = ({ playlist, onClose, onUpdated }) => {
    const [title, setTitle] = useState(playlist.title);
    const [description, setDescription] = useState(playlist.description || '');
    const [isTitleEmpty, setIsTitleEmpty] = useState(false);
    const draggableRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                handleUpdate();
            } else if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [title, description]);

    const handleUpdate = async () => {
        if (!title.trim()) {
            return;
        }
    
        try {
            await updatePlaylist(playlist.id, { title, description });
            eventBus.emit('playlistUpdated', { id: playlist.id, title, description });
            onUpdated();
            onClose();
        } catch (error) {
        }
    };

    const handleTitleChange = (e) => {
        const value = e.target.value;
        setTitle(value);
        setIsTitleEmpty(value.trim() === '');
      };

    return (
        <div className="update-playlist__overlay" onClick={onClose}>
            <Draggable handle=".update-playlist__title" nodeRef={draggableRef}>
                <div className="update-playlist__form" onClick={(e) => e.stopPropagation()} ref={draggableRef}>
                    <h2 className='update-playlist__title'>Edit details</h2>
                    {isTitleEmpty && 
                        <Warning message="Playlist name is required." />
                    }
                    <FormInput label="Name" type="text" placeholder='Enter name' value={title} onChange={handleTitleChange} spellCheck="false" required={true} isWarning={isTitleEmpty} />
                    <FormTextarea label="Description" type="text" placeholder='Enter description' value={description} onChange={(e) => setDescription(e.target.value)} spellCheck="false" maxLength={400}/>
                    <div className="update-playlist__buttons">
                        <button className="update-playlist__button update-playlist__button--update" onClick={handleUpdate}>Save</button>
                        <button className="update-playlist__button update-playlist__button--cancel" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </Draggable>
        </div>
    );
};