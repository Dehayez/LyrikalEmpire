import React from 'react';
import { IoAdd } from 'react-icons/io5';
import './AddBeatButton.scss';

const AddBeatButton = ({ setIsOpen }) => (
  <button 
    style={{
      position: 'fixed', 
      bottom: '130px', 
      right: '30px', 
      transition: 'bottom 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) 0.1s',
      backgroundColor: '#505050',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '48px',
      height: '48px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '24px',
    }} 
    onClick={() => setIsOpen(true)}
    className="icon-button"
  >
    <span className="tooltip tooltip__addbeat">Add Beat</span>
    <IoAdd/>
  </button>
);

export default AddBeatButton;