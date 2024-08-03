import React, { useState, useEffect, useRef } from 'react';
import { addAssociationsToBeat, removeAssociationFromBeat, getAssociationsByBeatId } from '../../services';
import { useData } from '../../contexts/DataContext';
import { IconButton } from '../Buttons';
import { IoCloseSharp } from "react-icons/io5";
import './SelectableInput.scss';

export const SelectableInput = ({ items, beatId, associationType, headerIndex }) => {
  const { genres, moods, keywords, features } = useData();

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const inputContainerRef = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const toSingular = (plural) => {
    if (plural.endsWith('s')) {
      return plural.slice(0, -1);
    }
    return plural;
  };

  const singularAssociationType = toSingular(associationType);
  
  const findNameById = (id, items) => {
    const item = items.find(item => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const renderName = (item) => {
    if (item.name) {
      return item.name;
    } else if (item.genre_id) {
      return findNameById(item.genre_id, genres);
    } else if (item.mood_id) {
      return findNameById(item.mood_id, moods);
    } else if (item.keyword_id) {
      return findNameById(item.keyword_id, keywords);
    } else if (item.feature_id) {
      return findNameById(item.feature_id, features);
    }
    return 'Unknown';
  };

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const associations = await getAssociationsByBeatId(beatId, associationType);
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
    if (inputContainerRef.current && !isFocused) {
      inputContainerRef.current.scrollLeft = 0;
    }
  };

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleItemSelect = async (item) => {
    inputRef.current.focus();
    const isSelected = selectedItems.some(selectedItem => selectedItem[`${singularAssociationType}_id`] === item.id);
    const updatedItems = isSelected
      ? selectedItems.filter(i => i[`${singularAssociationType}_id`] !== item.id)
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

  const handleRemoveAssociation = async (item) => {
    const associationId = item[`${singularAssociationType}_id`];
    try {
      console.log('Removing association:', { beatId, associationType, associationId });
      await removeAssociationFromBeat(beatId, associationType, associationId);
      setSelectedItems(prevItems => prevItems.filter(item => item.id !== associationId));
    } catch (error) {
      console.error('Failed to remove association:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current.blur();
    }
  };

  return (
    <div className="selectable-input" ref={containerRef}>
      <div 
        className={`selectable-input__input-container ${isFocused ? 'selectable-input__input-container--focused' : ''}`}
        onClick={() => inputRef.current.focus()}
        ref={inputContainerRef}
      >
      <div className="selectable-input__selected-list">
        {selectedItems.map((item, index) => (
          <span key={index} className={`selectable-input__selected-list__item ${isFocused ? 'selectable-input__selected-list__item--focused' : ''}`}>
            {renderName(item)}
            {isFocused ? 
            <IconButton className="selectable-input__selected-list__item__icon" onClick={() => handleRemoveAssociation(item)}>
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
        const isSelected = selectedItems.some(selectedItem => selectedItem[`${singularAssociationType}_id`] === item.id);
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