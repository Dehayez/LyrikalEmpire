import React, { useState, useEffect, useRef } from 'react';
import { IoChevronDownSharp, IoCloseSharp } from "react-icons/io5";
import Button from '../Buttons'
import './FilterDropdown.scss';

export const FilterDropdown = ({ id, name, label, options, onFilterChange }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleClear = () => {
    setSelectedItems([]);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => { 
    console.log(selectedItems);
  }, [selectedItems]);

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <span 
        onClick={toggleDropdown} 
        className={`filter-dropdown__label-container ${isDropdownOpen ? 'filter-dropdown__label-container--active' : ''}`}
      >
        {label && <span className="filter-dropdown__label-text">{label}</span>}
        <IoChevronDownSharp className="filter-dropdown__label-icon" />
      </span>
      {isDropdownOpen && (
        <div className="filter-dropdown__wrapper">
          <div className="filter-dropdown__list">
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
                    className="filter-dropdown__option-input"
                  />
                  <span onClick={() => handleSelect(option)} className="filter-dropdown__option-text">{option.name}</span>
                </div>
              );
            })}
          </div>
          <div className="filter-dropdown__actions">
            <Button size="small" type="transparent" className="filter-dropdown__clear-button" onClick={handleClear}>Clear</Button>
            <Button size="small" className="filter-dropdown__close-button" type='primary' onClick={() => setIsDropdownOpen(false)}>Close</Button>
          </div>
        </div>
      )}
      {selectedItems.length > 0 && (
        <div className="filter-dropdown__selected">
          {selectedItems.map(item => {
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