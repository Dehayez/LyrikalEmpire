import React from 'react';
import Modal from 'react-modal';
import { IoCloseSharp } from "react-icons/io5";
import './ConfirmModal.scss';

Modal.setAppElement('#root');

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => (
  <Modal 
    isOpen={isOpen} 
    onRequestClose={onCancel} 
    style={{
      overlay: {
        backgroundColor: 'rgba(30, 30, 30, 0.75)',
        zIndex: 2,
      },
      content: {
        backgroundColor: '#181818',
        color: 'white', 
        border: 'none',
        borderRadius: '6px',
        maxWidth: '380px',
        margin: 'auto', 
        padding: '20px',
        display: 'inline-table'
      }
    }}
  >
    <button 
      onClick={onCancel} 
      style={{
        position: 'absolute', 
        right: '10px', 
        top: '10px',
        color: 'white',
        backgroundColor: '#181818',
        border: 'none'
      }}
    >
      <IoCloseSharp style={{ fontSize: '18px' }} />
    </button>
    <h2 style={{ marginTop: '0' }}>Confirm</h2>
    <p>{message}</p>
    <button className="modal__button modal__button--delete" onClick={onConfirm}>Delete</button>
    <button className="modal__button" onClick={onCancel}>Cancel</button>
  </Modal>
);

export default ConfirmModal;