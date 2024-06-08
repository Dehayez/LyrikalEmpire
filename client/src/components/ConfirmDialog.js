import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // replace '#root' with the id of your app's root element

const ConfirmDialog = ({ isOpen, message, onConfirm, onCancel }) => (
  <Modal isOpen={isOpen} onRequestClose={onCancel}>
    <h2>Confirm</h2>
    <p>{message}</p>
    <button onClick={onConfirm}>Yes</button>
    <button onClick={onCancel}>No</button>
  </Modal>
);

export default ConfirmDialog;