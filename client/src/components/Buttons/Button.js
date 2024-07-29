import React from 'react';
import './Button.scss';

const Button = ({ className, onClick, text, type }) => {
  const buttonClass = `button ${className} ${type === 'submit' ? 'button--submit' : ''}`;

  return (
    <button className={buttonClass} onClick={onClick} type={type}>
      {text}
    </button>
  );
};

export default Button;