import { useState, useEffect } from 'react';

export const useSelectableList = (fetchDataFunction, initialValue = '') => {
  initialValue = initialValue || '';

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(initialValue);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showItems, setShowItems] = useState(false);
  // Ensure selectedItems is derived from a string
  const [selectedItems, setSelectedItems] = useState(initialValue.split(',').map(item => item.trim()).filter(Boolean));

  useEffect(() => {
    const fetchData = async () => {
      const fetchedItems = await fetchDataFunction();
      setItems(fetchedItems);
      if (initialValue) {
        setFilteredItems(fetchedItems.filter(item => initialValue.split(',').map(i => i.trim()).includes(item.name)));
      } else {
        setFilteredItems(fetchedItems);
      }
    };
    fetchData();
  }, [fetchDataFunction, initialValue]);

  useEffect(() => {
    const itemsArray = (selectedItem || '').split(',').map(item => item.trim()).filter(Boolean);
    setSelectedItems(itemsArray);
    setFilteredItems(items.filter(item => item.name.toLowerCase().includes(itemsArray[itemsArray.length - 1]?.toLowerCase() || '')));
  }, [selectedItem, items]);

  const handleItemChange = (e) => {
    const input = e.target.value || ''; 
    const itemsArray = input.split(',').map(item => item.trim()).filter(Boolean);

    if (input.endsWith(', ') || input.endsWith(',')) {
      setSelectedItem(input);
      setSelectedItems(itemsArray);
      setFilteredItems(items);
    } else {
      let newItemsArray = itemsArray;
      const newInput = newItemsArray.join(', ');
      setSelectedItem(newInput);
      setSelectedItems(newItemsArray);
      const lastTypedWord = newItemsArray[newItemsArray.length - 1] || '';
      setFilteredItems(items.filter(item => item.name.toLowerCase().includes(lastTypedWord.toLowerCase())));
    }
  };

  const handleItemToggle = (itemName) => {
    let updatedSelectedItems;
    if (selectedItems.includes(itemName)) {
      updatedSelectedItems = selectedItems.filter(g => g !== itemName);
    } else {
      const itemParts = selectedItem.split(',').map(part => part.trim());
      const lastPart = itemParts[itemParts.length - 1];
      if (itemName.toLowerCase().includes(lastPart.toLowerCase())) {
        itemParts[itemParts.length - 1] = itemName;
      } else {
        itemParts.push(itemName);
      }
      updatedSelectedItems = itemParts;
    }
    setSelectedItems(updatedSelectedItems);
    setSelectedItem(updatedSelectedItems.join(', '));
  };

  const handleItemFocus = () => {
    setShowItems(true);
    setFilteredItems(items);
  };

  const handleItemBlur = () => {
    setTimeout(() => setShowItems(false), 100);
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
    handleItemBlur
  };
}