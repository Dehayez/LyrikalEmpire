import React from 'react';
import './Inputs.scss';

export const SelectableInput = ({ label, placeholder, value, onChange, onFocus, onBlur, showItems, filteredItems, handleItemToggle }) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                type="text"
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
            />
            {showItems && (
                <div className="options-list">
                    {filteredItems.map((item, index) => (
                        <div 
                            key={index} 
                            className={`options-list__item ${item.selected ? 'options-list__item--selected' : ''}`}
                            onClick={() => handleItemToggle(item.name)}
                        >
                            {item.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};