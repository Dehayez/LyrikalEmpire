import { useEffect } from 'react';

const useLocalStorageEffect = (key, value) => {
  useEffect(() => {
    if (value !== undefined) {
      localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }
  }, [key, value]);
};

export const useLocalStorageSync = ({
  shuffle, repeat, currentBeat, selectedBeat, isLeftPanelVisible,
  isRightPanelVisible, viewState, customQueue, sortConfig,
  mode, isFilterDropdownVisible, searchText, urlKey, currentPage,
  volume, currentTime, timestamp
}) => {
  useLocalStorageEffect('shuffle', shuffle);
  useLocalStorageEffect('repeat', repeat);
  useLocalStorageEffect('currentBeat', currentBeat);
  useLocalStorageEffect('selectedBeat', selectedBeat);
  useLocalStorageEffect('isLeftPanelVisible', isLeftPanelVisible);
  useLocalStorageEffect('isRightPanelVisible', isRightPanelVisible);
  useLocalStorageEffect('lastView', viewState);
  useLocalStorageEffect('customQueue', customQueue);
  useLocalStorageEffect('sortConfig', sortConfig);
  useLocalStorageEffect('mode', mode);
  useLocalStorageEffect('isFilterDropdownVisible', isFilterDropdownVisible);
  useLocalStorageEffect('searchText', searchText);
  useLocalStorageEffect(urlKey, currentPage);
  useLocalStorageEffect('volume', volume);
  useLocalStorageEffect('currentTime', currentTime);
};