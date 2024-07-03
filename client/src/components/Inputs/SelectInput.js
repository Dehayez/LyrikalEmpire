import React from 'react';
import { IoChevronDownSharp } from "react-icons/io5";
import './Inputs.scss';

export const SelectInput = ({ label, selectedValue, onChange, options }) => (
    <div className="form-group">
        <label>{label}</label>
        <div className="select-wrapper">
            <select 
                className="select-wrapper__select" 
                value={selectedValue} 
                onChange={onChange}
                onFocus={(e) => e.target.style.color = 'white'}
                onBlur={(e) => e.target.style.color = selectedValue ? 'white' : 'grey'}
                style={{color: selectedValue ? 'white' : 'grey'}}
            >
                <option value="">{`Select ${label.toLowerCase()}`}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            <IoChevronDownSharp style={{ position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)' }} />
        </div>
    </div>
);