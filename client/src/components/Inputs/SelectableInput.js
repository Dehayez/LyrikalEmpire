import React, { useState, useEffect } from 'react';
import { addBeatAssociation, removeBeatAssociation, getBeatAssociations } from '../../services';
import './SelectableInput.scss';

export const SelectableInput = ({ items, beatId, associationType }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentSelectedItems, setCurrentSelectedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

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
    console.log(isFocused);
  }, [isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    updateDatabase();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleItemSelect = (item) => {
    const isSelected = currentSelectedItems.includes(item);
    const updatedItems = isSelected
      ? currentSelectedItems.filter(i => i !== item)
      : [...currentSelectedItems, item];

    setCurrentSelectedItems(updatedItems);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      updateDatabase();
    }
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
    <div className="selectable-input">
      <input
        className="selectable-input__field input"
        type="text"
        value={inputValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      />
      {isFocused && (
        <ul className="selectable-input__list">
          {filteredItems.map(item => (
            <li
              key={item.id}
              className="selectable-input__list-item"
              onClick={() => handleItemSelect(item)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};