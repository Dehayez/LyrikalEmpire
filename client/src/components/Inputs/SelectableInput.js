import React, { useState, useEffect } from 'react';
import './Inputs.scss';

export const SelectableInput = ({
  label, placeholder, value, onChange, onFocus, onBlur, showItems, filteredItems, handleItemToggle, className, onClick, spellCheck
}) => {
  const [selectedValues, setSelectedValues] = useState(value.split(',').map(item => item.trim()));
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1);
  // New state to manage visibility based on hover and click
  const [isListVisible, setIsListVisible] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
  
      if (e.key === 'ArrowDown') {
        setFocusedItemIndex(prevIndex => (prevIndex + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        setFocusedItemIndex(prevIndex => (prevIndex - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter' && focusedItemIndex !== -1) {
        const newItem = filteredItems[focusedItemIndex].name;
        const isAlreadySelected = selectedValues.includes(newItem);
        let newSelectedValues;
        if (isAlreadySelected) {
          newSelectedValues = selectedValues.filter(item => item !== newItem);
        } else {
          newSelectedValues = [...selectedValues, newItem];
        }
        onChange({ target: { value: newSelectedValues.join(', ') } });
        setFocusedItemIndex(-1);
        setIsListVisible(false); // Hide list after selection
      }
    }
  };

  useEffect(() => {
    setSelectedValues(value.split(',').map(item => item.trim()));
  }, [value]);

  useEffect(() => {
    if (!showItems) {
      setFocusedItemIndex(-1);
    }
  }, [showItems]);

  // Modified onClick to show the list
  const handleInputClick = (e) => {
    onClick && onClick(e);
    setIsListVisible(true);
  };

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
        onClick={handleInputClick}
        onMouseEnter={() => setIsListVisible(true)}
        onMouseLeave={() => setIsListVisible(false)}
        spellCheck={spellCheck}
      />
      {showItems && isListVisible && (
        <div className="options-list"
             onMouseEnter={() => setIsListVisible(true)}
             onMouseLeave={() => setIsListVisible(false)}>
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