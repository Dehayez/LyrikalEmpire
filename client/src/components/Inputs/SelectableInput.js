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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current.blur();
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
      className={`selectable-input__input-container ${isFocused ? 'selectable-input__input-container--focused' : ''} ${isNewBeat ? 'selectable-input__input-container--new-beat' : ''}`}
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
        autoComplete="off"
      />
      <label htmlFor={`selectable-input-${associationType}-${beatId}-${headerIndex}`} className={`form-group__label ${inputValue || isFocused || selectedItems.length > 0 ? 'form-group__label--active' : ''}`}>
        {label}
      </label>
    </div>
    {isFocused && (
      <ul className="selectable-input__list">
        {associationItems.map(item => {
          const isSelected = isItemSelected(item);
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
</div>
  );
};