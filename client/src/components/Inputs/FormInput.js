import React from 'react';
import './Inputs.scss';

export const FormInput = ({ id, name, label, type, placeholder, value, onChange, required, min, pattern, maxLength, className, isWarning }) => (
    <div className={`form-group ${className || ''}`}>
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
            onFocus={(e) => e.target.nextSibling.classList.add('form-group__label--active')}
            onBlur={(e) => !e.target.value && e.target.nextSibling.classList.remove('form-group__label--active')}
        />
        <label htmlFor={id} className={`form-group__label ${value || document.activeElement === document.getElementById(id) ? 'form-group__label--active' : ''}`}>
            {label} {required && <span className="form-group__label--required">*</span>}
        </label>
    </div>
);