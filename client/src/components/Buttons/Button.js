import React from 'react';
import classNames from 'classnames';
import './Button.scss';

const Button = ({ className, onClick, children, text, type = 'button', variant, size }) => {
  const buttonClass = classNames(
    'button',
    className,
    {
      'button--primary': variant === 'primary',
      'button--transparent': variant === 'transparent',
      'button--outline': variant === 'outline',
      'button--warning': variant === 'warning',
      [`button--${size}`]: size,
    }
  );

  return (
    <button className={buttonClass} onClick={onClick} type={type}>
      {text}
      {children}
    </button>
  );
};

export default Button;