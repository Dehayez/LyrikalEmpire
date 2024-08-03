import React, { useState, useEffect, useRef } from 'react';
import { addAssociationsToBeat, removeAssociationFromBeat, getAssociationsByBeatId } from '../../services';
import { useData } from '../../contexts/DataContext';
import { IconButton } from '../Buttons';
import { IoCloseSharp } from "react-icons/io5";
import './SelectableInput.scss';

export const SelectableInput = ({ items, beatId, associationType, headerIndex }) => {
  const { genres, moods, keywords, features } = useData();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const inputContainerRef = useRef(null);

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const associations = await getAssociationsByBeatId(beatId, associationType);
        console.log('associations:', associations);
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
    console.log(selectedItems);
  }, [selectedItems]);

  useEffect(() => {
    const maxWidth = localStorage.getItem(`headerWidth${headerIndex}`);
    if (maxWidth && inputContainerRef.current) {
      inputContainerRef.current.style.maxWidth = `${maxWidth}px`;
    }
  }, []);

  const handleFocus = () => setIsFocused(true);

  const handleBlur = (e) => {
    e.preventDefault();
    if (inputContainerRef.current && !isFocused) {
      inputContainerRef.current.scrollLeft = 0;
    }
  };

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleItemSelect = async (item) => {
    inputRef.current.focus();
    const isSelected = selectedItems.includes(item);
    const updatedItems = isSelected
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];

    setSelectedItems(updatedItems);

    try {
      if (isSelected) {
        await removeAssociationFromBeat(beatId, associationType, item.id);
      } else {
        await addAssociationsToBeat(beatId, associationType, [item.id]);
      }
    } catch (error) {
      console.error('Error updating associations:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current.blur();
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
        {selectedItems.map(item => (
          <span key={item.id} className={`selectable-input__selected-list__item ${isFocused ? 'selectable-input__selected-list__item--focused' : ''}`}>
            {item.name}
            {isFocused ? 
              <IconButton className="selectable-input__selected-list__item__icon" onClick={() => handleItemSelect(item)}>
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
            const isSelected = selectedItems.includes(item);
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