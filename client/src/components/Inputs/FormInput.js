import React from 'react';
import './Inputs.scss';

export const FormInput = ({ label, type, placeholder, value, onChange, required, min, pattern, maxLength, className, isWarning }) => (
    <div className={`form-group ${className || ''}`}>
        <label>{label}</label>
        <input className={`form-group__input ${isWarning ? 'form-group__input--warning' : ''}`} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} min={min} pattern={pattern} maxLength={maxLength} />
    </div>
);