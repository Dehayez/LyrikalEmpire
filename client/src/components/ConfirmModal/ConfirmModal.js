import React from 'react';
import DraggableModal from '../Modals/DraggableModal';
import './ConfirmModal.scss';

const ConfirmModal = ({ isOpen, title = "Confirm", message, confirmButtonText = "Confirm", cancelButtonText = "Cancel", onConfirm, onCancel }) => {
  return (
    <DraggableModal
      isOpen={isOpen}
      title={title}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmButtonText={confirmButtonText}
      cancelButtonText={cancelButtonText}
    >
      <p>{message}</p>
    </DraggableModal>
  );
};

export default ConfirmModal;