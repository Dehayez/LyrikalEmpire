import React, { useState, useEffect, useRef } from 'react';
import { addAssociationsToBeat, removeAssociationFromBeat, getAssociationsByBeatId } from '../../services';
import { useHeaderWidths, useData } from '../../contexts';
import { SelectedList } from './SelectedList';
import './SelectableInput.scss';

export const SelectableInput = ({ beatId, associationType, headerIndex, label, placeholder, disableFocus, isNewBeat, newBeatId }) => {
  const { headerWidths } = useHeaderWidths();
  const { genres, moods, keywords, features } = useData();

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const inputContainerRef = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pendingAssociations, setPendingAssociations] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const items = {
    moods,
    genres,
    keywords,
    features
  }[associationType];

  const associationItems = items.filter(item => 
    item.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const toSingular = (plural) => {
    if (plural.endsWith('s')) {
      return plural.slice(0, -1);
    }
    return plural;
  };

  const singularAssociationType = toSingular(associationType);

  const isItemSelected = (item) => {
    return selectedItems.some(selectedItem => selectedItem[`${singularAssociationType}_id`] === item.id);
  };

  const handleFocus = () => {
    setIsFocused(true);
    inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleContainerClick = () => {
    inputRef.current.classList.remove('selectable-input__input--hidden');
    inputRef.current.focus();
    inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleBlur = (e) => {
    e.preventDefault();
    setFocusedIndex(-1);
    if (inputContainerRef.current && !isFocused) {
      inputContainerRef.current.scrollLeft = 0;
    }
  };

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleItemSelect = async (item) => {
    const associationId = item.id;
    const newAssociation = {
      beat_id: beatId,
      [`${singularAssociationType}_id`]: associationId
    };
  
    const isSelected = selectedItems.some(selectedItem => selectedItem[`${singularAssociationType}_id`] === associationId);
  
    if (isSelected) {
      await handleRemoveAssociation(newAssociation);
    } else {
      if (isNewBeat) {
        setSelectedItems(prevItems => [...prevItems, newAssociation]);
        setPendingAssociations(prevItems => [...prevItems, associationId]);
      } else {
        try {
          await addAssociationsToBeat(beatId, associationType, [associationId]);
          setSelectedItems(prevItems => [...prevItems, newAssociation]);
        } catch (error) {
          console.error('Failed to add association:', error);
        }
      }
    }
    setInputValue('');
    inputRef.current.focus();
  };

  const handleRemoveAssociation = async (item) => {
    const associationId = item[`${singularAssociationType}_id`];
    if (isNewBeat) {
      setSelectedItems(prevItems => prevItems.filter(item => item[`${singularAssociationType}_id`] !== associationId));
      setPendingAssociations(prevItems => prevItems.filter(id => id !== associationId));
    } else {
      try {
        await removeAssociationFromBeat(beatId, associationType, associationId);
        setSelectedItems(prevItems => prevItems.filter(item => item[`${singularAssociationType}_id`] !== associationId));
      } catch (error) {
        console.error('Failed to remove association:', error);
      }
    }
  };

  const scrollToFocusedItem = (index) => {
    const listItems = containerRef.current.querySelectorAll('.selectable-input__list-item');
    if (listItems[index]) {
      listItems[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setFocusedIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % associationItems.length;
        scrollToFocusedItem(newIndex);
        return newIndex;
      });
    } else if (e.key === 'ArrowUp') {
      setFocusedIndex((prevIndex) => {
        const newIndex = prevIndex - 1 < 0 ? associationItems.length - 1 : prevIndex - 1;
        scrollToFocusedItem(newIndex);
        return newIndex;
      });
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      handleItemSelect(associationItems[focusedIndex]);
    }
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
  }, [headerWidths]);

  useEffect(() => {
    if (isNewBeat && newBeatId && pendingAssociations.length > 0) {
      const uploadPendingAssociations = async () => {
        try {
          await addAssociationsToBeat(newBeatId, associationType, pendingAssociations);
          setPendingAssociations([]);
        } catch (error) {
          console.error('Failed to upload pending associations:', error);
        }
      };
  
      uploadPendingAssociations();
    }
  }, [newBeatId, isNewBeat, associationType, pendingAssociations]);

  return (
<div className={`selectable-input-container `}>
  <div className={`selectable-input ${label ? 'selectable-input--label' : ''}`} ref={containerRef}>
    <div
      className={`selectable-input__input-container 
        ${isFocused ? 'selectable-input__input-container--focused' : ''} 
        ${isNewBeat ? 'selectable-input__input-container--new-beat' : ''} 
        ${disableFocus ? 'selectable-input__input-container--disabled' : ''}`}
      onClick={handleContainerClick}
      ref={inputContainerRef}
    >
      <SelectedList selectedItems={selectedItems} isFocused={isFocused} handleRemoveAssociation={handleRemoveAssociation} />
      <input
        ref={inputRef}
        id={`selectable-input-${associationType}-${beatId}-${headerIndex}`}
        className={`form-group__input selectable-input__input ${!isFocused ? 'selectable-input__input--hidden' : ''}`}
        placeholder={selectedItems.length === 0 ? placeholder : ''}
        type="text"
        value={inputValue}
        onFocus={(e) => {
          handleFocus();
          e.target.nextSibling.classList.add('form-group__label--active');
        }}
        onBlur={(e) => {
          handleBlur(e);
          if (!inputValue && selectedItems.length === 0) {
            e.target.nextSibling.classList.remove('form-group__label--active');
          }
        }}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        disabled={disableFocus}
        autoComplete="off"
      />
      <label htmlFor={`selectable-input-${associationType}-${beatId}-${headerIndex}`} className={`form-group__label ${inputValue || isFocused || selectedItems.length > 0 ? 'form-group__label--active' : ''}`}>
        {label}
      </label>
    </div>
    {isFocused && (
      <ul className="selectable-input__list">
        {associationItems.map((item, index) => {
          const isSelected = isItemSelected(item);
          return (
            <li
              key={item.id}
              className={`selectable-input__list-item 
                ${isSelected ? 'selectable-input__list-item--selected' : ''} 
                ${focusedIndex === index ? 'selectable-input__list-item--focused' : ''}`}
              onClick={() => handleItemSelect(item)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              {item.name}
            </li>
          );
        })}
      </ul>
    )}
  </div>
</div>
  );
};