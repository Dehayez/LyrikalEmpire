import React, { useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import Modal from 'react-modal';
import './ConfirmModal.scss';

Modal.setAppElement('#root');

const modalStyle = {
  overlay: {
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
    zIndex: 3,
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
    transform: 'translate(-50%, -50%)'
  }
};

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  const draggableRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        onConfirm();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onConfirm]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onCancel} style={modalStyle}>
      <Draggable handle=".modal__title" nodeRef={draggableRef}>
        <div ref={draggableRef} className='modal'>
          <div className='modal-content'>
            <h2 className='modal__title' style={{ marginTop: '0' }}>Confirm</h2>
            <p>{message}</p>
            <button className="modal__button modal__button--delete" onClick={onConfirm}>Delete</button>
            <button className="modal__button" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </Draggable>
    </Modal>
  );
};

export default ConfirmModal;