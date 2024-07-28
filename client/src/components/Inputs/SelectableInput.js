import React, { useState, useEffect } from 'react';
import './Inputs.scss';
import { addNewItem } from '../../services/addNewItem'; // Import the function to add new items

export const SelectableInput = ({
  label, placeholder, value, onChange, onFocus, onBlur, showItems, filteredItems, handleItemToggle, className, onClick, spellCheck, onMouseDown, onKeyDown, itemType
}) => {
  const [selectedValues, setSelectedValues] = useState(value.split(',').map(item => item.trim()));
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1);
  const [isListVisible, setIsListVisible] = useState(false);

  const addItem = async (newItem) => {
    if (newItem && !filteredItems.some(item => item.name === newItem)) {
      const sentenceCaseItem = newItem.charAt(0).toUpperCase() + newItem.slice(1).toLowerCase();
      await addNewItem(itemType, sentenceCaseItem); // Add new item to the database
      onChange({ target: { value: [...selectedValues, sentenceCaseItem].join(', ') } });
    }
  };
  
  const handleKeyDown = async (e) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
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
        setIsListVisible(false);
      } else if (e.key === 'Enter' && focusedItemIndex === -1) {
        const inputValue = e.target.value.trim();
        const lastCommaIndex = inputValue.lastIndexOf(',');
        const newItem = lastCommaIndex !== -1 ? inputValue.slice(lastCommaIndex + 1).trim() : inputValue;
        const sentenceCaseItem = newItem.charAt(0).toUpperCase() + newItem.slice(1).toLowerCase();
  
        if (newItem && !filteredItems.some(item => item.name === newItem) && !selectedValues.includes(newItem)) {
          await addNewItem(itemType, sentenceCaseItem); // Add new item to the database
          onChange({ target: { value: [...selectedValues, sentenceCaseItem].join(', ') } });
          e.target.value = ''; // Clear the input value
        }
      }
    }
  };

  const handleBlur = async (e) => {
    const inputValue = e.target.value.trim();
    const lastCommaIndex = inputValue.lastIndexOf(',');
    const newItem = lastCommaIndex !== -1 ? inputValue.slice(lastCommaIndex + 1).trim() : inputValue;
    const sentenceCaseItem = newItem.charAt(0).toUpperCase() + newItem.slice(1).toLowerCase();
  
    if (newItem && !filteredItems.some(item => item.name === newItem)) {
      await addNewItem(itemType, sentenceCaseItem); // Add new item to the database
      onChange({ target: { value: [...selectedValues, sentenceCaseItem].join(', ') } });
      e.target.value = ''; // Clear the input value
    }
    if (onBlur) {
      onBlur(e);
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

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isListVisible) {
        setIsListVisible(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isListVisible]);

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
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        onKeyDown={handleKeyDown}
        onClick={handleInputClick}
        onMouseEnter={() => setIsListVisible(true)}
        onMouseLeave={() => setIsListVisible(false)}
        spellCheck={spellCheck}
        onMouseDown={onMouseDown}
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