import React, { useState, useEffect, useRef } from 'react';
import { IoChevronDownSharp, IoCloseSharp } from "react-icons/io5";

import { useLocalStorageSync } from '../../hooks';
import { getInitialState, getInitialStateForFilters } from '../../utils/stateUtils';
import { isMobileOrTablet } from '../../utils'; // Import the mobile detection utility

import { Button } from '../Buttons';
import './FilterDropdown.scss';

export const FilterDropdown = React.forwardRef(({ filters, onFilterChange }, ref) => {
  const dropdownRefs = useRef({});

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

  const toggleDropdown = (filterType, event) => {
    // Stop propagation to prevent the click from bubbling up to document
    if (event) {
      event.stopPropagation();
    }
    
    setIsDropdownOpen(prevState => {
      const newState = {};
      
      // If the clicked dropdown is already open, close everything
      if (prevState[filterType]) {
        return newState; // Empty object = all closed
      }
      
      // Otherwise, close all dropdowns and open only the clicked one
      newState[filterType] = true;
      return newState;
    });
  };

  const handleClear = (filterType) => {
    setSelectedItems(prevState => ({
      ...prevState,
      [filterType]: []
    }));
    onFilterChange([], filterType);
  };

  const handleClickOutside = (event) => {
    // Only close dropdowns if clicking outside any dropdown
    const isOutside = !Object.keys(dropdownRefs.current).some(key => 
      dropdownRefs.current[key] && dropdownRefs.current[key].contains(event.target)
    );
    
    if (isOutside) {
      setIsDropdownOpen({});
    }
  };

  const handleOverlayClick = (event) => {
    event.stopPropagation();
    setIsDropdownOpen({});
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasOpenDropdown = Object.values(isDropdownOpen).some(Boolean);

  return (
    <div className="filter-dropdown-container" ref={ref}>
      {/* Mobile overlay - only show on mobile when dropdown is open */}
      {isMobileOrTablet() && hasOpenDropdown && (
        <div 
          className="filter-dropdown__overlay"
          onClick={handleOverlayClick}
        />
      )}
      
      <div className="filter-dropdowns-container">
        {filters.map(({ id, name, label, options }) => (
          <div 
            key={id} 
            className={`filter-dropdown ${name === 'hidden' ? 'hidden-filter' : ''}`} 
            ref={el => dropdownRefs.current[name] = el}
          >
            <span
              onClick={(e) => toggleDropdown(name, e)}
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
                <div className="filter-dropdown__header">
                  {label}
                </div>
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
                  <Button size="small" className="filter-dropdown__close-button" variant='primary' onClick={(e) => toggleDropdown(name, e)}>Done</Button>
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
});