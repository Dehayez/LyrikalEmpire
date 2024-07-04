import React, { useState, useEffect } from 'react';
import './Inputs.scss';

export const SelectableInput = ({
  label, placeholder, value, onChange, onFocus, onBlur, showItems, filteredItems, handleItemToggle, className, onClick, spellCheck
}) => {
  const [selectedValues, setSelectedValues] = useState(value.split(',').map(item => item.trim()));
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation(); // Stop the event from propagating further
  
      if (e.key === 'ArrowDown') {
        setFocusedItemIndex(prevIndex => (prevIndex + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        setFocusedItemIndex(prevIndex => (prevIndex - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter' && focusedItemIndex !== -1) {
        const newItem = filteredItems[focusedItemIndex].name;
        const newSelectedValues = selectedValues.includes(newItem) ? selectedValues : [...selectedValues, newItem];
        onChange({ target: { value: newSelectedValues.join(', ') } }); // Update the input value
        setFocusedItemIndex(-1); // Reset focus
      }
    }
  };

  // Update selectedValues state when value prop changes
  useEffect(() => {
    setSelectedValues(value.split(',').map(item => item.trim()));
  }, [value]);

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
        onKeyDown={handleKeyDown}
        onClick={onClick}
        spellCheck={spellCheck}
      />
      {showItems && (
        <div className="options-list">
          {filteredItems.map((item, index) => {
            const isSelected = selectedValues.includes(item.name);
            const isFocused = index === focusedItemIndex;
            return (
              <div
                key={index}
                className={`options-list__item ${isSelected ? 'options-list__item--selected' : ''} ${isFocused ? 'options-list__item--focused' : ''}`}
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