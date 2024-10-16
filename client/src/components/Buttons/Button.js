import React from 'react';
import './Button.scss';

const Button = ({ className, onClick, children, text, type = 'button', variant, size }) => {
  const buttonClass = [
    'button',
    className,
    variant === 'primary' && 'button--primary',
    variant === 'transparent' && 'button--transparent',
    variant === 'warning' && 'button--warning',
    size && `button--${size}`
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClass.trim()} onClick={onClick} type={type}>
      {text}
      {children}
    </button>
  );
};

export default Button;