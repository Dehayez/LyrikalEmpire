import React, { useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import Modal from 'react-modal';
import { Button, IconButton } from '../Buttons';
import {IoCloseSharp} from 'react-icons/io5';
import './DraggableModal.scss';

Modal.setAppElement('#root');

const modalStyle = {
  overlay: {
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
    zIndex: 10,
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

const DraggableModal = ({ isOpen, setIsOpen, title, children, onConfirm, onCancel, confirmButtonText="Save", cancelButtonText="Cancel", cancelButtonType="transparent", confirmButtonType="primary" }) => {
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

  const handleCancel = () => {
    setIsOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={handleCancel} style={modalStyle}>
      <Draggable handle=".modal__title" nodeRef={draggableRef}>
        <div ref={draggableRef} className='modal'>
          <div className='modal-content'>
            <IconButton className="modal__close-button" onClick={handleCancel}>
                <IoCloseSharp />
            </IconButton>
            <h2 className='modal__title'>{title}</h2>
            {children}
            <div className='modal__buttons'>
              <Button type={cancelButtonType} onClick={handleCancel}>{cancelButtonText}</Button>
              <Button type={confirmButtonType} onClick={onConfirm}>{confirmButtonText}</Button>
            </div>
          </div>
        </div>
      </Draggable>
    </Modal>
  );
};

export default DraggableModal;