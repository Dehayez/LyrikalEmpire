import React from 'react';
import './Inputs.scss';

export const FormInput = ({ id, name, label, type, placeholder, value, onChange, required, min, pattern, maxLength, className, isWarning }) => (
    <div className={`form-group ${className || ''}`}>
        <span className='form-group__label'>{label}</span>
        <input 
            className={`form-group__input ${isWarning ? 'form-group__input--warning' : ''}`} 
            id={id} 
            name={name} 
            type={type} 
            placeholder={placeholder} 
            value={value} 
            onChange={onChange} 
            required={required} 
            min={min} 
            pattern={pattern} 
            maxLength={maxLength} 
            autoComplete="off"
        />
    </div>
);