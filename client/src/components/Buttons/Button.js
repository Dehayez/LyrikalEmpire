import React from 'react';
import './Button.scss';

const Button = ({ className, onClick, children, text, type, size }) => {
  const buttonClass = `
    button 
    ${className} 
    ${type === 'primary' ? 'button--primary' : ''} 
    ${size ? `button--${size}` : ''} 
    ${type === 'transparent' ? 'button--transparent' : ''}
  `;

  return (
    <button className={buttonClass.trim()} onClick={onClick} type={type}>
      {text}
      {children}
    </button>
  );
};

export default Button;