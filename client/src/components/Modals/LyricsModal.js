import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import Modal from 'react-modal';
import { IconButton } from '../Buttons';
import { FormTextarea } from '../Inputs';
import { IoCloseSharp } from 'react-icons/io5';
import './LyricsModal.scss';
import { Form } from '../Form';

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
      className="lyrics-modal"
    >
      <Draggable handle=".modal__title" nodeRef={draggableRef}>
        <div ref={draggableRef} className='modal'>
          <div className='modal-content'>
            <IconButton className="modal__close-button" onClick={handleCancel}>
              <IoCloseSharp />
            </IconButton>
            <h2 className='modal__title'>Lyrics</h2>
            <FormTextarea value='' onChange={() => {}} required={true} rows={10} />
          </div>
        </div>
      </Draggable>
    </Modal>
  );
};

export default LyricsModal;