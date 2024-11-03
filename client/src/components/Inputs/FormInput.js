import React, { useState } from 'react';
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import './Inputs.scss';

export const FormInput = ({ id, name, label, type, placeholder, value, onChange, required, min, pattern, maxLength, className, isWarning }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <div className={`form-group ${className || ''}`}>
            <input 
                className={`form-group__input poopie ${isWarning ? 'form-group__input--warning' : ''}`} 
                id={id} 
                name={name} 
                type={isPasswordVisible && type === 'password' ? 'text' : type} 
                placeholder={placeholder} 
                value={value} 
                onChange={onChange} 
                required={required} 
                min={min} 
                pattern={pattern} 
                maxLength={maxLength} 
                autoComplete="off"
                onFocus={(e) => e.target.nextSibling.classList.add('form-group__label--active')}
                onBlur={(e) => !e.target.value && e.target.nextSibling.classList.remove('form-group__label--active')}
            />
            <label htmlFor={id} className={`form-group__label ${value || document.activeElement === document.getElementById(id) ? 'form-group__label--active' : ''}`}>
                {label}
            </label>
            {type === 'password' && (
                <span className="form-group__toggle" onClick={togglePasswordVisibility}>
                    {isPasswordVisible ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </span>
            )}
        </div>
    );
};