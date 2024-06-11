import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const closeButtonStyle = {
  position: 'absolute', 
  right: '10px', 
  top: '10px'
};

const ConfirmDialog = ({ isOpen, message, onConfirm, onCancel }) => (
  <Modal isOpen={isOpen} onRequestClose={onCancel}>
    <button onClick={onCancel} style={closeButtonStyle}>X</button>
    <h2>Confirm</h2>
    <p>{message}</p>
    <button onClick={onConfirm}>Delete</button>
    <button onClick={onCancel}>Cancel</button>
  </Modal>
);

export default ConfirmDialog;