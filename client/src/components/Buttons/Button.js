import React from 'react';
import './Button.scss';

const Button = ({ className, onClick, text }) => {
  return (
    <button className={`button ${className}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;