import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../contexts';
import './Inputs.scss';

export const SelectableInput = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const inputRef = useRef(null);
  const { genres, moods, keywords, features } = useData();

  const allItems = [...genres, ...moods, ...keywords, ...features];

  useEffect(() => {
    if (isFocused) {
      setFilteredItems(allItems);
    }
  }, [isFocused, allItems]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    setFilteredItems(allItems.filter(item => item.toLowerCase().includes(inputValue.toLowerCase())));
  };

  const handleItemClick = (item) => {
    onChange(item);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 100);
  };

  return (
    <div className="selectable-input">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="selectable-input__field"
      />
      {isFocused && (
        <ul className="selectable-input__list">
          {filteredItems.map((item, index) => (
            <li key={index} onClick={() => handleItemClick(item)} className="selectable-input__item">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};