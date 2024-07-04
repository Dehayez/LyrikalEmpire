import React from 'react';
import './Inputs.scss';

export const SelectableInput = ({ label, placeholder, value, onChange, onFocus, onBlur, showItems, filteredItems, handleItemToggle, className, onKeyDown, onClick, spellCheck }) => {
  const selectedValues = value.split(',').map(item => item.trim());

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
        className={className}
        onKeyDown={onKeyDown}
        onClick={onClick}
        spellCheck={spellCheck}
      />
      {showItems && (
        <div className="options-list">
          {filteredItems.map((item, index) => {
            const isSelected = selectedValues.includes(item.name);
            return (
              <div
                key={index}
                className={`options-list__item ${isSelected ? 'options-list__item--selected' : ''}`}
                onClick={() => handleItemToggle(item.name)}
              >
                {item.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};