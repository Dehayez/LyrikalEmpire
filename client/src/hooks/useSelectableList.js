import { useState, useEffect } from 'react';
import { addAssociationsToBeat, removeAssociationFromBeat } from '../services';

export const useSelectableList = (beatId, fetchedItems, initialValue = '') => {
  initialValue = initialValue || '';

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(initialValue);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showItems, setShowItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState([initialValue]);
  const [isBlurOrEnter, setIsBlurOrEnter] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setItems(fetchedItems);
      if (initialValue) {
        setFilteredItems(fetchedItems.filter(item => initialValue === item.name));
      } else {
        setFilteredItems(fetchedItems);
      }
    };
    fetchData();
  }, [fetchedItems, initialValue]);

  useEffect(() => {
    const itemsArray = [selectedItem];
    setSelectedItems(itemsArray);
    setFilteredItems(items.filter(item => item.name.toLowerCase().includes(itemsArray[0]?.toLowerCase() || '')));
  }, [selectedItem, items]);

  const handleItemChange = (e) => {
    const input = e.target.value || ''; 
    const itemsArray = [input];

    setSelectedItem(input);
    setSelectedItems(itemsArray);
    const lastTypedWord = itemsArray[0] || '';
    setFilteredItems(items.filter(item => item.name.toLowerCase().includes(lastTypedWord.toLowerCase())));
  };

  const handleItemToggle = async (itemName) => {
    let updatedSelectedItems;
    if (selectedItems.includes(itemName)) {
      updatedSelectedItems = selectedItems.filter(g => g !== itemName);
      try {
        await removeAssociationFromBeat(beatId, 'associationType', itemName);
      } catch (error) {
        console.error('Failed to remove association:', error);
      }
    } else {
      updatedSelectedItems = [itemName];
      try {
        await addAssociationsToBeat(beatId, 'associationType', itemName);
      } catch (error) {
        console.error('Failed to add association:', error);
      }
    }
    setSelectedItems(updatedSelectedItems);
  };

  const handleItemFocus = () => {
    setShowItems(true);
    setFilteredItems(items);
  };

  const handleItemBlur = () => {
    setTimeout(() => {
      setShowItems(false);
      setIsBlurOrEnter(true);
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsBlurOrEnter(true);
    }
  };

  return {
    items,
    selectedItem,
    filteredItems,
    showItems,
    selectedItems,
    handleItemChange,
    handleItemToggle,
    handleItemFocus,
    handleItemBlur,
    handleKeyDown,
    isBlurOrEnter,
  };
};