import React from 'react';
import './Button.scss';

const Button = ({ className, onClick, children, text, type, size }) => {
  const buttonClass = `
    button 
    ${className} 
    ${type === 'primary' ? 'button--primary' : ''} 
    ${type === 'transparent' ? 'button--transparent' : ''}
    ${type === 'warning' ? 'button--warning' : ''}
    ${size ? `button--${size}` : ''} 
  `;

  return (
    <button className={buttonClass.trim()} onClick={onClick} type={type}>
      {text}
      {children}
    </button>
  );
};

export default Button;