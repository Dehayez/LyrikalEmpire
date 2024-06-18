import React from 'react';
import { IoAdd } from 'react-icons/io5';
import './AddBeatButton.scss';

const AddBeatButton = ({ setIsOpen, addBeatButtonBottom, animateAddButton, setAnimateAddButton }) => (
  <button 
    style={{
      position: 'fixed', 
      bottom: `${addBeatButtonBottom}px`, 
      right: '20px', 
      transition: 'bottom 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) 0.1s',
      backgroundColor: '#505050',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '24px',
    }} 
    onClick={() => setIsOpen(true)}
    className={`icon-button ${animateAddButton ? 'animate-scale' : ''}`} 
    onMouseDown={() => setAnimateAddButton(true)}
    onMouseUp={() => setAnimateAddButton(false)}
    onMouseLeave={() => setAnimateAddButton(false)}
  >
    <span className="tooltip tooltip__addbeat">Add Beat</span>
    <IoAdd />
  </button>
);

export default AddBeatButton;