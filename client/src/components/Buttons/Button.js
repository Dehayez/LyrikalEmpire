import React from 'react';
import './Button.scss';

const Button = ({ className, onClick, children, text, type }) => {
  const buttonClass = `button ${className} ${type === 'submit' ? 'button--submit' : ''}`;

  return (
    <button className={buttonClass} onClick={onClick} type={type}>
      {text}
      {children}
    </button>
  );
};

export default Button;