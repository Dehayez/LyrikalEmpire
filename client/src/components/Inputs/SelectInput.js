import React from 'react';
import { IoChevronDownSharp } from "react-icons/io5";
import './Inputs.scss';

export const SelectInput = ({ id, name, label, selectedValue, onChange, options }) => (
    <div className="form-group">
        {label ? <label htmlFor={id}>{label}</label> : null}
        <div className="select-wrapper">
            <select 
                id={id}
                name={name}
                className="select-wrapper__select" 
                value={selectedValue} 
                onChange={onChange}
                onFocus={(e) => e.target.style.color = 'white'}
                onBlur={(e) => e.target.style.color = selectedValue ? 'white' : '#828282'}
                style={{color: selectedValue ? 'white' : '#828282'}}
            >
                {label && <option value="">{`Select ${label.toLowerCase()}`}</option>}
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            <IoChevronDownSharp style={{ position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)' }} />
        </div>
    </div>
);