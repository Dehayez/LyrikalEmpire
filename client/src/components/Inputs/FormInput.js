import React from 'react';
import './Inputs.scss';

export const FormInput = ({ label, type, placeholder, value, onChange, required, min, pattern, maxLength }) => (
    <div className="form-group">
        <label>{label}</label>
        <input className='form-group__input' type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} min={min} pattern={pattern} maxLength={maxLength} />
    </div>
);