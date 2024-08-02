import React, { useState, useEffect, useRef } from 'react';
import { addBeatAssociation, removeBeatAssociation, getBeatAssociations } from '../../services';
import { IconButton } from '../Buttons';
import { IoCloseSharp } from "react-icons/io5";
import './SelectableInput.scss';

export const SelectableInput = ({ items, beatId, associationType, headerIndex }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentSelectedItems, setCurrentSelectedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const inputContainerRef = useRef(null);

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const associations = await getBeatAssociations(beatId, associationType);
        setCurrentSelectedItems(associations);
        setSelectedItems(associations);
      } catch (error) {
        console.error('Error fetching associations:', error);
      }
    };

    fetchAssociations();
  }, [beatId, associationType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const maxWidth = localStorage.getItem(`headerWidth${headerIndex}`);
    if (maxWidth && inputContainerRef.current) {
      inputContainerRef.current.style.maxWidth = `${maxWidth}px`;
    }
  }, []);

  const handleFocus = () => setIsFocused(true);

  const handleBlur = (e) => {
    e.preventDefault();
    updateDatabase();
  };

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleItemSelect = (item) => {
    inputRef.current.focus();
    const updatedItems = currentSelectedItems.includes(item)
      ? currentSelectedItems.filter(i => i !== item)
      : [...currentSelectedItems, item];

    setCurrentSelectedItems(updatedItems);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') updateDatabase();
  };

  const updateDatabase = async () => {
    const itemsToAdd = currentSelectedItems.filter(item => !selectedItems.includes(item));
    const itemsToRemove = selectedItems.filter(item => !currentSelectedItems.includes(item));

    try {
      await Promise.all([
        ...itemsToAdd.map(item => addBeatAssociation(beatId, associationType, item)),
        ...itemsToRemove.map(item => removeBeatAssociation(beatId, associationType, item))
      ]);
      setSelectedItems(currentSelectedItems);
    } catch (error) {
      console.error('Error updating associations:', error);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="selectable-input" ref={containerRef}>
      <div 
        className={`selectable-input__input-container ${isFocused ? 'selectable-input__input-container--focused' : ''}`}
        onClick={() => inputRef.current.focus()}
        ref={inputContainerRef}
      >
        <div className="selectable-input__selected-list">
          {currentSelectedItems.map(item => (
            <span key={item.id} className={`selectable-input__selected-list__item ${isFocused ? 'selectable-input__selected-list__item--focused' : ''}`}>
              {item.name}
                {isFocused ? 
                <IconButton className="selectable-input__selected-list__item__icon">
                  <IoCloseSharp fontSize={16} />
                </IconButton> : null}
            </span>
          ))}
          <input
            ref={inputRef}
            className="selectable-input__input input"
            type="text"
            value={inputValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      {isFocused && (
        <ul className="selectable-input__list">
          {filteredItems.map(item => {
            const isSelected = selectedItems.includes(item) || currentSelectedItems.includes(item);
            return (
              <li
                key={item.id}
                className={`selectable-input__list-item ${isSelected ? 'selectable-input__list-item--selected' : ''}`}
                onClick={() => handleItemSelect(item)}
              >
                {item.name}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};