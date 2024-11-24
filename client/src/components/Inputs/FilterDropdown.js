import React, { useState, useEffect, useRef } from 'react';
import { IoChevronDownSharp, IoCloseSharp } from "react-icons/io5";

import { useLocalStorageSync } from '../../hooks';
import { getInitialState, getInitialStateForFilters } from '../../utils/stateUtils';

import { Button } from '../Buttons';
import './FilterDropdown.scss';

export const FilterDropdown = ({ filters, onFilterChange }) => {
  const dropdownRef = useRef(null);

  const initialSelectedItems = getInitialStateForFilters(filters, []);
  const initialDropdownState = getInitialStateForFilters(filters, false);
  
  const [selectedItems, setSelectedItems] = useState(() => getInitialState('selectedItems', initialSelectedItems));
  const [isDropdownOpen, setIsDropdownOpen] = useState(() => getInitialState('isDropdownOpen', initialDropdownState));

  useLocalStorageSync({
    selectedItems,
    isDropdownOpen
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

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !event.target.closest('.filter-dropdown__wrapper')) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="filter-dropdown-container">
      <div className="filter-dropdowns-container">
        {filters.map(({ id, name, label, options }) => (
          <div key={id} className={`filter-dropdown ${name === 'hidden' ? 'hidden-filter' : ''}`} ref={dropdownRef}>
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
                        <span onClick={() => handleSelect(name, option)} className="filter-dropdown__option-text">
                          {option.name} <span className="filter-dropdown__option-text-count">{option.count}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="filter-dropdown__actions">
                  <Button size="small" variant="transparent" className="filter-dropdown__clear-button" onClick={() => handleClear(name)}>Clear</Button>
                  <Button size="small" className="filter-dropdown__close-button" variant='primary' onClick={() => toggleDropdown(name)}>Close</Button>
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