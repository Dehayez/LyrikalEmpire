import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import Modal from 'react-modal';
import { IconButton } from '../Buttons';
import { IoCloseSharp } from 'react-icons/io5';
import './LyricsModal.scss';

Modal.setAppElement('#modal-root');

const modalStyle = {
  overlay: {
    backgroundColor: 'transparent', 
    zIndex: 10,
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

const LyricsModal = ({ isOpen = true, setIsOpen }) => { 
  const draggableRef = useRef(null);

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={handleCancel} 
      style={modalStyle} 
      shouldCloseOnOverlayClick={false}
    >
      <Draggable handle=".modal__title" nodeRef={draggableRef}>
        <div ref={draggableRef} className='modal'>
          <div className='modal-content'>
            <IconButton className="modal__close-button" onClick={handleCancel}>
              <IoCloseSharp />
            </IconButton>
            <h2 className='modal__title'>Lyrics</h2>
            <textarea className='modal__textarea' placeholder='Enter lyrics here...'></textarea>
          </div>
        </div>
      </Draggable>
    </Modal>
  );
};

export default LyricsModal;