import React from 'react';
import Modal from 'react-modal';
import { IoCloseSharp } from "react-icons/io5";
import './ConfirmDialog.scss';

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
    backgroundColor: 'rgba(30, 30, 30, 0.75)'
  },
  content: {
    backgroundColor: '#181818',
    color: 'white', 
    border: 'none',
    borderRadius: '6px',
    maxWidth: '380px',
    margin: 'auto', 
  }
};

const buttonStyle = {
  backgroundColor: '#202020',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  margin: '10px 10px 10px 0',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};

const ConfirmDialog = ({ isOpen, message, onConfirm, onCancel }) => (
  <Modal portalClassName="dialog"  isOpen={isOpen} onRequestClose={onCancel} style={modalStyle}>
    <button onClick={onCancel} style={closeButtonStyle}>
      <IoCloseSharp style={{ fontSize: '18px' }} />
    </button>
    <h2 style={h2Style}>Confirm</h2>
    <p>{message}</p>
    <button className="dialog-button" onClick={onConfirm} style={buttonStyle}>Delete</button>
    <button className="dialog-button" onClick={onCancel} style={buttonStyle}>Cancel</button>
  </Modal>
);

export default ConfirmDialog;