import React from 'react';
import Modal from 'react-modal';
import { IoCloseSharp } from "react-icons/io5";
import './ConfirmModal.scss';

Modal.setAppElement('#root');

const closeButtonStyle = {
  position: 'absolute', 
  right: '10px', 
  top: '10px',
  color: 'white',
  backgroundColor: '#181818',
  border: 'none'
};

const h2Style = {
  marginTop: '0',
};

const modalStyle = {
  overlay: {
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    backgroundColor: '#181818',
    color: 'white', 
    border: 'none',
    borderRadius: '6px',
    maxWidth: '380px',
    position: 'relative',
    margin: 'auto',
    boxSizing: 'border-box',
  }
};

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => (
  <Modal isOpen={isOpen} onRequestClose={onCancel} style={modalStyle}>
    <button onClick={onCancel} style={closeButtonStyle}>
      <IoCloseSharp style={{ fontSize: '18px' }} />
    </button>
    <h2 style={h2Style}>Confirm</h2>
    <p>{message}</p>
    <button className="modal__button modal__button--delete" onClick={onConfirm}>Delete</button>
    <button className="modal__button" onClick={onCancel}>Cancel</button>
  </Modal>
);

export default ConfirmModal;