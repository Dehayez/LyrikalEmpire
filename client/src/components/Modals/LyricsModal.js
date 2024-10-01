import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import Modal from 'react-modal';
import { IconButton } from '../Buttons';
import { FormTextarea } from '../Inputs';
import { IoCloseSharp } from 'react-icons/io5';
import { getAssociationsByBeatId } from '../../services/beatService';
import { getLyricsById } from '../../services/lyricsService';
import './LyricsModal.scss';

Modal.setAppElement('#modal-root');

const modalStyle = {
  overlay: {
    backgroundColor: 'transparent', 
    zIndex: 3,
    pointerEvents: 'none', 
  },
  content: {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    height: '100%',
    width: '100%',
    margin: 'auto',
    position: 'absolute',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none', 
  }
};

const LyricsModal = ({ isOpen = true, setIsOpen, beatId }) => { 
  const draggableRef = useRef(null);
  const [lyrics, setLyrics] = useState('');

  const handleCancel = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    console.log(lyrics);
  }, [lyrics]);

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const data = await getAssociationsByBeatId(beatId, 'lyrics');
        if (data && data.length > 0 && data[0].lyric_id) {
          const lyricData = await getLyricsById(data[0].lyric_id);
          if (lyricData && lyricData.lyrics) {
            setLyrics(lyricData.lyrics);
          } else {
            setLyrics('');
          }
        } else {
          setLyrics('');
        }
      } catch (error) {
        console.error('Failed to fetch lyrics:', error);
      }
    };
  
    if (beatId) {
      fetchLyrics();
    }
  }, [beatId]);

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={handleCancel} 
      style={modalStyle} 
      shouldCloseOnOverlayClick={false}
      className="lyrics-modal"
    >
      <Draggable handle=".modal__title" nodeRef={draggableRef}>
        <div ref={draggableRef} className='modal'>
          <div className='modal-content'>
            <IconButton className="modal__close-button" onClick={handleCancel}>
              <IoCloseSharp />
            </IconButton>
            <h2 className='modal__title'>Lyrics</h2>
            <FormTextarea value={lyrics} onChange={() => {}} required={true} rows={10} />
          </div>
        </div>
      </Draggable>
    </Modal>
  );
};

export default LyricsModal;