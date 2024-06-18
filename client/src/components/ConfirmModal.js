import React from 'react';
import Modal from 'react-modal';
import { IoCloseSharp } from "react-icons/io5";
import './ConfirmModal.scss';

Modal.setAppElement('#root');

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => (
  <Modal 
    isOpen={isOpen} 
    onRequestClose={onCancel} 
    className="modal"
  >
    <button onClick={onCancel} className="modal__close-button">
      <IoCloseSharp />
    </button>
    <h2 className="modal__title">Confirm</h2>
    <p className="modal__message">{message}</p>
    <button className="modal__button modal__button--delete" onClick={onConfirm}>Delete</button>
    <button className="modal__button" onClick={onCancel}>Cancel</button>
  </Modal>
);

export default ConfirmModal;