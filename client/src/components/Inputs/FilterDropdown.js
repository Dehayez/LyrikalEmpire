import React, { useState, useEffect, useRef } from 'react';
import { IoChevronDownSharp, IoCloseSharp } from "react-icons/io5";

import { useLocalStorageSync, useDragToDismiss } from '../../hooks';
import { getInitialState, getInitialStateForFilters } from '../../utils/stateUtils';
import { isMobileOrTablet, slideIn, slideOut } from '../../utils';

import { Button } from '../Buttons';
import './FilterDropdown.scss';

export const FilterDropdown = React.forwardRef(({ filters, onFilterChange }, ref) => {
  const dropdownRefs = useRef({});

  const initialSelectedItems = getInitialStateForFilters(filters, []);
  const initialDropdownState = getInitialStateForFilters(filters, false);
  
  const [selectedItems, setSelectedItems] = useState(() => getInitialState('selectedItems', initialSelectedItems));
  const [isDropdownOpen, setIsDropdownOpen] = useState(() => getInitialState('isDropdownOpen', initialDropdownState));
  const [searchTerms, setSearchTerms] = useState({});

  const hasOpenDropdown = Object.values(isDropdownOpen).some(Boolean);
  
  const {
    dismissRef,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useDragToDismiss(() => {
    closeAllDropdowns();
  });

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
    if (event) {
      event.stopPropagation();
    }
    
    setIsDropdownOpen(prevState => {
      const newState = {};
      
      if (prevState[filterType]) {
        return newState;
      }
      
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

  const handleSearch = (filterType, searchTerm) => {
    setSearchTerms(prevState => ({
      ...prevState,
      [filterType]: searchTerm
    }));
  };

  const getFilteredOptions = (options, filterType) => {
    const searchTerm = searchTerms[filterType];
    if (!searchTerm) return options;
    
    return options.filter(option => 
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const closeAllDropdowns = () => {
    if (isMobileOrTablet()) {
      const overlay = document.querySelector('.filter-dropdown__overlay');
      const activeDropdown = document.querySelector('.filter-dropdown__wrapper');
      if (activeDropdown) {
        slideOut(activeDropdown, overlay, () => {
          setIsDropdownOpen({});
          setSearchTerms({});
        });
      } else {
        setIsDropdownOpen({});
        setSearchTerms({});
      }
    } else {
      setIsDropdownOpen({});
      setSearchTerms({});
    }
  };

  const handleClickOutside = (event) => {
    const isOutside = !Object.keys(dropdownRefs.current).some(key => 
      dropdownRefs.current[key] && dropdownRefs.current[key].contains(event.target)
    );
    
    if (isOutside) {
      closeAllDropdowns();
    }
  };

  const handleOverlayClick = (event) => {
    event.stopPropagation();
    closeAllDropdowns();
  };

  // Add this effect to handle slide in animation when dropdown opens
  useEffect(() => {
    if (isMobileOrTablet() && hasOpenDropdown) {
      const activeWrapper = dismissRef.current;
      if (activeWrapper) {
        slideIn(activeWrapper);
      }
    }
  }, [hasOpenDropdown]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const element = dismissRef.current;
    if (element && isMobileOrTablet()) {
      element.addEventListener('touchmove', handleDragMove, { passive: false });
    }
    return () => {
      if (element) {
        element.removeEventListener('touchmove', handleDragMove);
      }
    };
  }, [handleDragMove]);

  return (
    <div className="filter-dropdown-container" ref={ref}>
      {/* Mobile overlay */}
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
              <div 
                className="filter-dropdown__wrapper"
                ref={isMobileOrTablet() ? dismissRef : null}
                onTouchStart={isMobileOrTablet() ? handleDragStart : undefined}
                onTouchEnd={isMobileOrTablet() ? handleDragEnd : undefined}
                onClick={(e) => e.stopPropagation()}
              >
                {isMobileOrTablet() && (
                  <div className="filter-dropdown__header">
                    {label}
                  </div>
                )}
                <div className="filter-dropdown__search">
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={searchTerms[name] || ''}
                    onChange={(e) => handleSearch(name, e.target.value)}
                    className="filter-dropdown__search-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="filter-dropdown__list">
                  {getFilteredOptions(options, name).map(option => {
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
    </div>
  );
});