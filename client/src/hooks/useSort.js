import { useState, useMemo } from 'react';
import { sortBeats } from '../utils/sortBeats';

export const useSort = (items = [], initialSortConfig = { key: null, direction: 'ascending' }) => {
  const [sortConfig, setSortConfig] = useState(initialSortConfig);

  const sortedItems = useMemo(() => {
    if (!Array.isArray(items)) {
      console.error('useSort: items is not an array', items);
      return [];
    }
    return sortBeats(items, sortConfig);
  }, [items, sortConfig]);

  const onSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : sortConfig.direction === 'descending' ? null : 'ascending';
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  return { sortedItems, sortConfig, onSort };
};