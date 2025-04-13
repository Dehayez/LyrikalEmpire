import React, { useRef, useEffect, useState } from 'react';
import { IoSearchSharp, IoCloseSharp } from "react-icons/io5";
import classNames from 'classnames';
import { getInitialState, isMobileOrTablet } from '../../utils';
import IconButton from '../Buttons/IconButton';

import '../BeatList/BeatList.scss';

export const SearchInput = ({
  searchText,
  setSearchText,
  currentPage,
  setCurrentPage,
  previousPage,
  setPreviousPage,
}) => {
  const searchInputRef = useRef(null);
  const [isSearchVisible, setIsSearchVisible] = useState(() => getInitialState('searchText', '') !== '');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        isSearchVisible &&
        !searchText
      ) {
        setIsSearchVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchVisible, searchText]);

  const toggleSearchVisibility = () => {
    const willBeVisible = !isSearchVisible;
    setIsSearchVisible(willBeVisible);

    if (willBeVisible) {
      setTimeout(() => searchInputRef.current?.focus(), 200);
    }
  };

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchText(newValue);

    if (newValue && searchText === '') {
      setPreviousPage(currentPage);
      setCurrentPage(1);
    } else if (!newValue) {
      setCurrentPage(previousPage);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    localStorage.setItem('searchText', '');
    searchInputRef.current?.focus();
    setCurrentPage(previousPage);
  };

  return (
    <div
      className={classNames('beat-list__search-container', {
        'beat-list__search-container--active': isSearchVisible,
      })}
      onClick={(e) => e.stopPropagation()}
    >
      <IconButton
        className={classNames(
          'beat-list__action-button',
          'beat-list__action-button--search',
          {
            'beat-list__action-button--search--active': searchText && !isSearchVisible,
            'beat-list__action-button--search--closed': !isSearchVisible,
          }
        )}
        onClick={toggleSearchVisibility}
        text="Search in tracks"
        tooltipPosition="left"
      >
        <IoSearchSharp />
      </IconButton>
      <input
        id="search-input"
        ref={searchInputRef}
        type="text"
        placeholder={isSearchVisible ? "Search tracks" : ""}
        value={searchText}
        onChange={handleSearchChange}
        className={`beat-list__search-input ${isSearchVisible ? 'visible' : ''}`}
        autoComplete="off"
      />
      {isSearchVisible && searchText && (
        <IconButton
          className="beat-list__action-button--clear"
          onClick={clearSearch}
          text="Clear search"
          tooltipPosition="left"
        >
          <IoCloseSharp />
        </IconButton>
      )}
    </div>
  );
};

export default SearchInput;