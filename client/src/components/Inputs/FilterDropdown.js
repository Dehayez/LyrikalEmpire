import React, { useState, useEffect } from 'react';
import { IoChevronDownSharp, IoCloseSharp } from "react-icons/io5";

export const FilterDropdown = ({ id, name, label, options, onFilterChange }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (item) => {
    const isSelected = selectedItems.some(selectedItem => selectedItem.id === item.id);
    const newSelectedItems = isSelected
      ? selectedItems.filter(selectedItem => selectedItem.id !== item.id)
      : [...selectedItems, item];

    setSelectedItems(newSelectedItems);
    onFilterChange(newSelectedItems);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => { 
    console.log(selectedItems);
  }, [selectedItems]);

  return (
    <div className="filter-dropdown">
      {label && <span onClick={toggleDropdown}>{label}</span>}
      {isDropdownOpen && (
        <div className="filter-dropdown__wrapper">
          {options.map(option => {
            const optionId = `${id}-${option.id}`;
            return (
              <div key={option.id} className="filter-dropdown__option">
                <input
                  type="checkbox"
                  id={optionId}
                  name={name}
                  value={option.id}
                  checked={selectedItems.some(selectedItem => selectedItem.id === option.id)}
                  onChange={() => handleSelect(option)}
                />
                <label htmlFor={optionId} onClick={() => handleSelect(option)}>{option.name}</label>
              </div>
            );
          })}
          <IoChevronDownSharp className="filter-dropdown__icon" />
        </div>
      )}
      {selectedItems.length > 0 && (
        <div className="filter-dropdown__selected">
          {selectedItems.map(item => {
            const selectedItemId = `${id}-selected-${item.id}`;
            return (
              <div key={item.id} className="filter-dropdown__selected-item">
                <span>{item.name}</span>
                <button onClick={() => handleSelect(item)}>
                  <IoCloseSharp />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};