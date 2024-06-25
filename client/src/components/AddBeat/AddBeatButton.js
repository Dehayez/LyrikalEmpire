import React from 'react';
import { IoAdd } from 'react-icons/io5';
import './AddBeatButton.scss';

const AddBeatButton = ({ setIsOpen }) => (
  <button 
    className="icon-button icon-button--addbeat"
    onClick={() => setIsOpen(true)}
  >
    <span className="tooltip tooltip__addbeat">Add Beat</span>
    <IoAdd/>
  </button>
);

export default AddBeatButton;