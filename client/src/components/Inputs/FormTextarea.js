import React from 'react';
import './Inputs.scss';

export const FormTextarea = ({ label, placeholder, value, onChange, required, rows, maxLength }) => (
    <div className="form-group">
        <label>{label}</label>
        <textarea
            className='form-group__input'
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            rows={rows}
            maxLength={maxLength}
        />
    </div>
);