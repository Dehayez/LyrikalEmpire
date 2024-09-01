import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { IoSearchSharp, IoCloseSharp, IoPencil, IoHeadsetSharp, IoLockClosedSharp, IoOptionsSharp } from "react-icons/io5";
import { toast, Slide } from 'react-toastify';

import { usePlaylist, useBeat, useData } from '../../contexts';
import { isMobileOrTablet, getInitialState } from '../../utils';
import { useHandleBeatClick, useBeatActions, useSort, useLocalStorageSync } from '../../hooks';
import { getBeatsByAssociation } from '../../services/beatService';

import BeatRow from './BeatRow';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { FilterDropdown } from '../Inputs/FilterDropdown';
import { IconButton } from '../Buttons';
import PaginationControls from './PaginationControls';
import TableHeader from './TableHeader';
import { Tooltip } from '../Tooltip';

import './BeatList.scss';

const BeatList = ({ onPlay, selectedBeat, isPlaying, moveBeat, currentBeat, addToCustomQueue, onBeatClick, externalBeats, headerContent, onDeleteFromPlaylist, deleteMode = 'default', playlistName, playlistId, onUpdateBeat, onUpdate, setBeats }) => {
  const tableRef = useRef(null);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);

  const location = useLocation();
  const [searchText, setSearchText] = useState(() => getInitialState('searchText', ''));
  const urlKey = `currentPage_${location.pathname}`;
  const [currentPage, setCurrentPage] = useState(() => getInitialState(urlKey, 1));
  const [previousPage, setPreviousPage] = useState(currentPage);
  
  const { genres, moods, keywords, features } = useData();
  const [selectedGenre, setSelectedGenre] = useState([]);
  const [selectedMood, setSelectedMood] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState([]);
  
  const { setPlaylistId } = usePlaylist();
  const { allBeats, paginatedBeats, isInputFocused, setRefreshBeats } = useBeat();
  const beats = externalBeats || allBeats;
  const [filteredBeats, setFilteredBeats] = useState(beats);

  useEffect(() => {
    const fetchBeatsByAssociation = async () => {
      const associations = [
        { type: 'genres', selected: selectedGenre },
        { type: 'moods', selected: selectedMood },
        { type: 'keywords', selected: selectedKeyword },
        { type: 'features', selected: selectedFeature }
      ];
  
      const activeAssociations = associations.filter(assoc => assoc.selected.length > 0);
  
      if (activeAssociations.length > 0) {
        try {
          const beatsByAssociations = await Promise.all(
            activeAssociations.map(async assoc => {
              const ids = assoc.selected.map(item => item.id);
              return await getBeatsByAssociation(assoc.type, ids);
            })
          );
  
          const combinedBeats = beatsByAssociations.flat();
          setFilteredBeats(combinedBeats);
        } catch (error) {
          console.error('Error fetching beats by associations:', error);
        }
      } else {
        setFilteredBeats(beats);
      }
    };
  
    fetchBeatsByAssociation();
  }, [selectedGenre, selectedMood, selectedKeyword, selectedFeature, beats]);
  
  const { sortedItems: sortedBeats, sortConfig, onSort } = useSort(filteredBeats);

  const filteredAndSortedBeats = useMemo(() => {
    return sortedBeats.filter(beat => {
      const fieldsToSearch = [beat.title];
      return fieldsToSearch.some(field => field && field.toLowerCase().includes(searchText.toLowerCase()));
    });
  }, [sortedBeats, searchText]);

  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef, currentBeat);
  const { handleUpdate, handleDelete } = useBeatActions();
  
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [beatsToDelete, setBeatsToDelete] = useState([]);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [isSearchVisible, setIsSearchVisible] = useState(() => getInitialState('searchText', '') !== '');
  const [mode, setMode] = useState(() => getInitialState('mode', 'edit'));
  const [isFilterDropdownVisible, setIsFilterDropdownVisible] = useState(() => getInitialState('isFilterDropdownVisible', false));

  useLocalStorageSync({ 
    mode, 
    isFilterDropdownVisible, 
    searchText,
    urlKey,
    currentPage
  });

  const toggleFilterDropdown = () => {
    setIsFilterDropdownVisible(prevState => !prevState);
  };

  const handleFilterChange = (selectedItems, filterType) => {
    switch (filterType) {
      case 'genres':
        setSelectedGenre(selectedItems);
        break;
      case 'moods':
        setSelectedMood(selectedItems);
        break;
      case 'keywords':
        setSelectedKeyword(selectedItems);
        break;
      case 'features':
        setSelectedFeature(selectedItems);
        break;
    }
  };
    
  const handlePlayPause = useCallback((beat) => {
    const isCurrentBeatPlaying = selectedBeat && selectedBeat.id === beat.id;
    onPlay(beat, !isCurrentBeatPlaying || !isPlaying, beats);
    setPlaylistId(playlistId);
  }, [selectedBeat, isPlaying, onPlay, beats, playlistId, setPlaylistId]);

  const toggleSearchVisibility = () => {
    const willBeVisible = !isSearchVisible;
    setIsSearchVisible(willBeVisible);
    if (willBeVisible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200);
    } else if (!isHovering) {
      setIsSearchVisible(false);
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

  const handleConfirm = async () => {
    if (beatsToDelete.length > 0) {
      if (onDeleteFromPlaylist) {
        await onDeleteFromPlaylist(beatsToDelete);
      } else {
        await Promise.all(beatsToDelete.map(beatId => handleDelete(beatId)));
      }
  
      const titlesToDelete = beatsToDelete.map(beatId => {
        const beat = beats.find(b => b.id === beatId);
        return beat ? beat.title : 'Unknown Track';
      });
  
      const message = beatsToDelete.length === 1
        ? <div><strong>{titlesToDelete[0]}</strong> has been {deleteMode === 'playlist' ? <>removed from <strong>{playlistName}</strong></> : 'deleted'}.</div>
        : <div><strong>{beatsToDelete.length} tracks</strong> have been {deleteMode === 'playlist' ? <>removed from <strong>{playlistName}</strong></> : 'deleted'}.</div>;
  
      setRefreshBeats(prev => !prev);
  
      setIsOpen(false);
      setBeatsToDelete([]);
  
      toast.dark(message, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        className: "Toastify__toast--warning",
      });
    }
  };

  const openConfirmModal = () => {
    setIsOpen(true);
    setBeatsToDelete(selectedBeats.map(beat => beat.id));
  };
  
  const toggleEdit = () => {
    const newState = mode === 'edit' ? 'listen' : mode === 'listen' ? 'lock' : 'edit';
    setMode(newState);
  
    toast.dismiss();
  
    setTimeout(() => {
      let message, icon;
      switch (newState) {
        case 'edit':
          message = 'Edit Mode Enabled';
          icon = <IoPencil/>;
          break;
        case 'listen':
          message = 'Listen Mode Enabled';
          icon = <IoHeadsetSharp/>;
          break;
        case 'lock':
          message = 'Lock Mode Enabled';
          icon = <IoLockClosedSharp/>;
          break;
      }
  
      toast(<>{message}</>, {
        position: "bottom-center",
        autoClose: 400,
        hideProgressBar: true,
        closeButton: false,
        pauseOnFocusLoss: false,
        className: `toaster--mode ${!isMobileOrTablet() ? 'toaster--mode--desktop' : ''}`,
        icon: icon,
        transition: Slide,
      });
    }, 250);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 100); 

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = 50; 
      const scrollPosition = containerRef.current.scrollTop;
      const opacity = Math.max(1 - scrollPosition / maxScroll, 0);
      setHeaderOpacity(opacity);
    };

    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target) && isSearchVisible && !searchText) {
        setIsSearchVisible(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchVisible, searchText]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && selectedBeats.length > 0) {
        handlePlayPause(selectedBeats[0]);
      }
      if (!isInputFocused && (event.key === 'Delete' || event.key === 'Backspace') && selectedBeats.length > 0) {
        openConfirmModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBeats, handlePlayPause, isInputFocused]);

  return (
    <div ref={containerRef} className="beat-list">
      <div className='beat-list__buffer'/>
      <div className="beat-list__header">
        {
          headerContent ? (
            headerContent
          ) : (
            <h2 className='beat-list__title'>All Tracks</h2>
          )
        }
        <div className='beat-list__actions'>
          <IconButton className='beat-list__action-button--edit' onClick={toggleEdit}>
            {mode === 'edit' ? 
            <>
              {!isMobileOrTablet() && (
                <Tooltip text="Switch to Listen Mode" position='left' />
              )}
              <IoPencil/> 
            </>
            : mode === 'listen' ?
            <>
              {!isMobileOrTablet() && (
              <Tooltip text="Switch to Lock Mode" position='left' />
            )}
              <IoHeadsetSharp/>
            </>
            :
            <>
              {!isMobileOrTablet() && (
              <Tooltip text="Switch to Edit Mode" position='left' />
            )}
              <IoLockClosedSharp/>
            </>
            }
          </IconButton>
          <IconButton className={`beat-list__action-button--options${isFilterDropdownVisible ? ' active' : ''}`} onClick={toggleFilterDropdown}>
              <Tooltip text={isFilterDropdownVisible ? "Hide Filter" : "Show Filter"} position='left' />
            <IoOptionsSharp/>
          </IconButton>
          <div className='beat-list__search-container' onClick={(e) => e.stopPropagation()}>
          <div className={`beat-list__action-button beat-list__action-button--search icon-button ${searchText && !isSearchVisible ? 'beat-list__action-button--search--active' : ''} ${!isSearchVisible ? 'beat-list__action-button--search--closed' : ''}`} onClick={toggleSearchVisibility}>
            {!isMobileOrTablet() && (
              <Tooltip text="Search in tracks" position='left' />
            )}
              <IoSearchSharp />
            </div>
            <input
              id='search-input'
              ref={searchInputRef}
              type="text"
              placeholder={isSearchVisible ? "Search tracks" : ""}
              value={searchText}
              onChange={handleSearchChange}
              className={`beat-list__search-input ${isSearchVisible ? 'visible' : ''}`}
              autoComplete="off"
            />
           {isSearchVisible && searchText && (
              <div 
                className="beat-list__action-button beat-list__action-button--clear" 
                onClick={() => {
                  setSearchText('');
                  localStorage.setItem('searchText', '');
                  searchInputRef.current?.focus();
                  setCurrentPage(previousPage);
              }}>
                <IoCloseSharp />
              </div>
            )}
          </div>
        </div>
      </div>

      {isFilterDropdownVisible && (
      <FilterDropdown
        filters={[
          { id: 'genre-filter', name: 'genres', label: 'Genres', options: genres },
          { id: 'mood-filter', name: 'moods', label: 'Moods', options: moods },
          { id: 'keyword-filter', name: 'keywords', label: 'Keywords', options: keywords },
          { id: 'feature-filter', name: 'features', label: 'Features', options: features },
          { id: 'hidden-filter', name: 'hidden', label: 'Hidden', options: [] }
        ]}
        onFilterChange={handleFilterChange}
      />
    )}
      

      {beats.length > 0 ? (
        filteredAndSortedBeats.length === 0 ? (
          <div className="placeholder-text">No tracks found</div>
        ) : (
          <div className='beat-list__table-container'>
            <table className={`beat-list__table ${mode === 'lock' ? 'beat-list__table--lock' : ''}`} ref={tableRef}>
              <TableHeader onSort={onSort} sortConfig={sortConfig} mode={mode} />

              <tbody>
                {paginatedBeats.map((beat, index) => (
                  <React.Fragment key={beat.id}>
                    {hoverIndex === index && hoverPosition === 'top' && <tr className="drop-line" />}
                    <BeatRow
                      key={`${beat.id}-${index}`}
                      beat={beat}
                      currentBeat={currentBeat}
                      index={index}
                      handlePlayPause={handlePlayPause}
                      handleUpdate={handleUpdate}
                      handleDelete={handleDelete}
                      selectedBeat={selectedBeat}
                      isPlaying={isPlaying}
                      handleBeatClick={handleBeatClick}
                      selectedBeats={selectedBeats}
                      openConfirmModal={openConfirmModal}
                      beats={beats}
                      addToCustomQueue={addToCustomQueue}
                      searchText={searchText}
                      mode={mode}
                      setActiveContextMenu={setActiveContextMenu}
                      activeContextMenu={activeContextMenu}
                      onBeatClick={onBeatClick}
                      deleteMode={deleteMode}
                      onUpdateBeat={onUpdateBeat}
                      onUpdate={onUpdate}
                      moveBeat={moveBeat}
                      playlistId={playlistId}
                      setBeats={setBeats}
                      setHoverIndex={setHoverIndex}
                      setHoverPosition={setHoverPosition}
                    />
                    {hoverIndex === index && hoverPosition === 'bottom' && <tr className="drop-line" />}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            <PaginationControls
              items={filteredAndSortedBeats}
              currentBeat={currentBeat}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )
      ) : (
        showMessage && <p className='placeholder-text'>No tracks are added yet.</p>
      )}
      <ConfirmModal 
        isOpen={isOpen} 
        setIsOpen={setIsOpen}
        title={`${deleteMode === 'playlist' ? 'Remove' : 'Delete'} ${beatsToDelete.length > 1 ? `tracks` : 'track'}`}
        message={<span>Are you sure you want to {deleteMode === 'playlist' ? 'remove' : 'delete'} {beatsToDelete.length > 1 ? `${beatsToDelete.length} tracks` : 'this track'}{deleteMode === 'playlist' ? <> from <strong>{playlistName}</strong></> : ''}?</span>}
        confirmButtonText={`${deleteMode === 'playlist' ? 'Remove' : 'Delete'}`}
        cancelButtonText="Cancel" 
        onConfirm={handleConfirm} 
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
};

export default BeatList;