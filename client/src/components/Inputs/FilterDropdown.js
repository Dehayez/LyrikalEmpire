import React, { useState, useEffect } from 'react';
import { IoChevronDownSharp, IoCloseSharp } from "react-icons/io5";
import { Button } from '../Buttons';
import './FilterDropdown.scss';

export const FilterDropdown = ({ filters, onFilterChange }) => {
  const [selectedItems, setSelectedItems] = useState(() => {
    const savedSelectedItems = localStorage.getItem('selectedItems');
    if (savedSelectedItems) {
      return JSON.parse(savedSelectedItems);
    }
    const initialSelectedItems = {};
    filters.forEach(filter => {
      initialSelectedItems[filter.name] = [];
    });
    return initialSelectedItems;
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(() => {
    const savedDropdownState = localStorage.getItem('isDropdownOpen');
    if (savedDropdownState) {
      return JSON.parse(savedDropdownState);
    }
    const initialDropdownState = {};
    filters.forEach(filter => {
      initialDropdownState[filter.name] = false;
    });
    return initialDropdownState;
  });

  const handleSelect = (filterType, item) => {
    const isSelected = selectedItems[filterType]?.some(selectedItem => selectedItem.id === item.id);
    const newSelectedItems = isSelected
      ? selectedItems[filterType].filter(selectedItem => selectedItem.id !== item.id)
      : [...(selectedItems[filterType] || []), item];
  
    setSelectedItems(prevState => ({
      ...prevState,
      [filterType]: newSelectedItems
    }));
    onFilterChange(newSelectedItems, filterType);
  };

  const toggleDropdown = (filterType) => {
    setIsDropdownOpen(prevState => ({
      ...prevState,
      [filterType]: !prevState[filterType]
    }));
  };

  const handleClear = (filterType) => {
    setSelectedItems(prevState => ({
      ...prevState,
      [filterType]: []
    }));
    onFilterChange([], filterType);
  };

  useEffect(() => {
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
  }, [selectedItems]);
  
  useEffect(() => {
    localStorage.setItem('isDropdownOpen', JSON.stringify(isDropdownOpen));
  }, [isDropdownOpen]);

  return (
    <div className="filter-dropdown-container">
      <div className="filter-dropdowns-container">
        {filters.map(({ id, name, label, options }) => (
          <div key={id} className="filter-dropdown">
            <span
              onClick={() => toggleDropdown(name)}
              className={`filter-dropdown__label-container ${isDropdownOpen[name] ? 'filter-dropdown__label-container--active' : ''}`}
            >
              {label && (
                <span className="filter-dropdown__label-text">
                  {label} {selectedItems[name]?.length > 0 && `(${selectedItems[name].length})`}
                </span>
              )}
              <IoChevronDownSharp className="filter-dropdown__label-icon" />
            </span>
            {isDropdownOpen[name] && (
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
                          checked={selectedItems[name]?.some(selectedItem => selectedItem.id === option.id)}
                          onChange={() => handleSelect(name, option)}
                          className="filter-dropdown__option-input"
                        />
                        <span onClick={() => handleSelect(name, option)} className="filter-dropdown__option-text">{option.name}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="filter-dropdown__actions">
                  <Button size="small" type="transparent" className="filter-dropdown__clear-button" onClick={() => handleClear(name)}>Clear</Button>
                  <Button size="small" className="filter-dropdown__close-button" type='primary' onClick={() => toggleDropdown(name)}>Close</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="filter-dropdown__selected">
      {Object.entries(selectedItems).flatMap(([filterType, items]) =>
          items.map(item => (
            <div key={item.id} className="filter-dropdown__selected-item" onClick={() => handleSelect(filterType, item)}>
              <span>{item.name}</span>
              <button>
                <IoCloseSharp />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};