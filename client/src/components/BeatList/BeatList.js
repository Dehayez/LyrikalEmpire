import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { IoPencil, IoHeadsetSharp } from "react-icons/io5";
import { toast, Slide } from 'react-toastify';

import { usePlaylist, useBeat, useData, useUser } from '../../contexts';
import { isMobileOrTablet, getInitialState } from '../../utils';
import { useHandleBeatClick, useBeatActions, useSort, useLocalStorageSync } from '../../hooks';
import { getBeatsByAssociation } from '../../services/beatService';

import BeatRow from './BeatRow';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { FilterDropdown } from '../Inputs/FilterDropdown';
import { IconButton } from '../Buttons';
import TableHeader from './TableHeader';
import { SearchInput } from '../Inputs/SearchInput';

import './BeatList.scss';

const BeatList = ({ onPlay, selectedBeat, isPlaying, moveBeat, currentBeat, addToCustomQueue, onBeatClick, externalBeats, headerContent, onDeleteFromPlaylist, deleteMode = 'default', playlistName, playlistId, onUpdateBeat, onUpdate, setBeats }) => {
  const tableRef = useRef(null);
  const containerRef = useRef(null);
  const tbodyRef = useRef(null);
  const { user } = useUser();
  const { genres, moods, keywords, features } = useData();
  const location = useLocation();

  const [searchText, setSearchText] = useState(() => getInitialState('searchText', ''));
  const urlKey = `currentPage_${location.pathname}`;
  const [currentPage, setCurrentPage] = useState(() => getInitialState(urlKey, 1));
  const [previousPage, setPreviousPage] = useState(currentPage);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  
  
  const { setPlaylistId } = usePlaylist();
  const { allBeats, paginatedBeats, inputFocused, setRefreshBeats, setCurrentBeats } = useBeat();
  const beats = externalBeats || allBeats;
  const [filteredBeats, setFilteredBeats] = useState(beats);

  // Virtual scrolling state
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [rowHeight, setRowHeight] = useState(60); // Default row height in pixels
  
  const { sortedItems: sortedBeats, sortConfig, onSort } = useSort(filteredBeats);
  
const [selectedGenre, setSelectedGenre] = useState(() => getInitialState('selectedItems', {}).genres || []);
const [selectedMood, setSelectedMood] = useState(() => getInitialState('selectedItems', {}).moods || []);
const [selectedKeyword, setSelectedKeyword] = useState(() => getInitialState('selectedItems', {}).keywords || []);
const [selectedFeature, setSelectedFeature] = useState(() => getInitialState('selectedItems', {}).features || []);
const [selectedTierlist, setSelectedTierlist] = useState(() => getInitialState('selectedItems', {}).tierlist || []);

const filteredAndSortedBeats = useMemo(() => {
  const result = sortedBeats.filter(beat => {
    const fieldsToSearch = [beat.title];
    const matchesSearchText = fieldsToSearch.some(
      field => field && field.toLowerCase().includes(searchText.toLowerCase())
    );
    const matchesTierlist =
      selectedTierlist.length === 0 ||
      selectedTierlist.some(item => beat.tierlist === item.id);

    return matchesSearchText && matchesTierlist;
  });
  return result;
}, [sortedBeats, searchText, selectedTierlist]);

  const filterDropdownRef = useRef(null);
  const [filterDropdownHeight, setFilterDropdownHeight] = useState(0);

  useEffect(() => {
    setCurrentBeats(filteredAndSortedBeats)
  }, [filteredAndSortedBeats]);

  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef, currentBeat);
  const { handleUpdate, handleDelete } = useBeatActions();
  
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [beatsToDelete, setBeatsToDelete] = useState([]);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [mode, setMode] = useState(() => getInitialState('mode', 'listen'));

  useLocalStorageSync({ 
    mode, 
    searchText,
    urlKey,
    currentPage
  });

  // Calculate which rows should be visible based on scroll position
  const calculateVisibleRows = useCallback(() => {
    if (!containerRef.current || !tableRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const scrollTop = containerRef.current.scrollTop;
    const viewportHeight = containerRef.current.clientHeight;
    
    // Calculate visible range with buffer
    const buffer = 5; // Number of extra rows to render above and below
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const endIndex = Math.min(
      filteredAndSortedBeats.length - 1,
      Math.ceil((scrollTop + viewportHeight) / rowHeight) + buffer
    );
    
    setVisibleRange({ start: startIndex, end: endIndex });
  }, [filteredAndSortedBeats.length, rowHeight]);

  // Measure actual row height on first render
  useEffect(() => {
    if (tbodyRef.current && tbodyRef.current.firstChild) {
      const actualHeight = tbodyRef.current.firstChild.getBoundingClientRect().height;
      if (actualHeight > 0) {
        setRowHeight(actualHeight);
      }
    }
  }, [paginatedBeats]);

  // Set up scroll event listener for virtualization
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      calculateVisibleRows();
      container.addEventListener('scroll', calculateVisibleRows);
      window.addEventListener('resize', calculateVisibleRows);
      
      return () => {
        container.removeEventListener('scroll', calculateVisibleRows);
        window.removeEventListener('resize', calculateVisibleRows);
      };
    }
  }, [calculateVisibleRows]);

  useEffect(() => {
    const updateFilterDropdownHeight = () => {
      if (filterDropdownRef.current) {
        const height = filterDropdownRef.current.offsetHeight;
        setFilterDropdownHeight(height + 60);
      }
    };
  
    updateFilterDropdownHeight();
  
    const resizeObserver = new ResizeObserver(updateFilterDropdownHeight);
    if (filterDropdownRef.current) {
      resizeObserver.observe(filterDropdownRef.current);
    }
  
    window.addEventListener('resize', updateFilterDropdownHeight);
  
    return () => {
      if (filterDropdownRef.current) {
        resizeObserver.unobserve(filterDropdownRef.current);
      }
      window.removeEventListener('resize', updateFilterDropdownHeight);
    };
  }, []);

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
      case 'tierlist':
        setSelectedTierlist(selectedItems);
        break;
      default:
        break;
    }
  };
    
const handlePlayPause = useCallback((beat) => {
  const isCurrentBeatPlaying = selectedBeat && selectedBeat.id === beat.id;
  onPlay(beat, !isCurrentBeatPlaying || !isPlaying, filteredAndSortedBeats, true);
  setPlaylistId(playlistId);
}, [selectedBeat, isPlaying, onPlay, filteredAndSortedBeats, playlistId, setPlaylistId]);

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
    const newState = mode === 'listen' ? 'edit' : 'listen';
    setMode(newState);

    toast.dismiss();

    setTimeout(() => {
        let message, icon;
        switch (newState) {
            case 'listen':
                message = 'Listen Mode Enabled';
                icon = <IoHeadsetSharp />;
                break;
            case 'edit':
                message = 'Edit Mode Enabled';
                icon = <IoPencil />;
                break;
        }

        toast(<>{message}</>, {
            position: "bottom-center",
            autoClose: 600,
            hideProgressBar: true,
            closeButton: false,
            pauseOnFocusLoss: true,
            className: `toaster--mode ${!isMobileOrTablet() ? 'toaster--mode--desktop' : ''}`,
            icon: icon,
            transition: Slide,
        });
    }, 50);
};

// Main filtering effect: service + tierlist
useEffect(() => {
  // Only run filter if beats are loaded
  if (!beats || beats.length === 0) {
    setFilteredBeats([]);
    return;
  }

  const fetchFiltered = async () => {
    const serviceAssocs = [
      { type: 'genres', selected: selectedGenre },
      { type: 'moods', selected: selectedMood },
      { type: 'keywords', selected: selectedKeyword },
      { type: 'features', selected: selectedFeature },
    ].filter((a) => a.selected.length > 0);

    let base = beats;
    if (serviceAssocs.length) {
      const lists = await Promise.all(
        serviceAssocs.map((assoc) => {
          const ids = assoc.selected.map((i) => i.id);
          // Use 'beats' as the base, not 'currentBeats'
          return getBeatsByAssociation(assoc.type, ids, beats, user.id);
        })
      );
      base = lists.flat();
    }
    if (selectedTierlist.length) {
      base = base.filter((b) => selectedTierlist.some((t) => b.tierlist === t.id));
    }
    setFilteredBeats(base);
  };
  fetchFiltered();
}, [selectedGenre, selectedMood, selectedKeyword, selectedFeature, selectedTierlist, user.id, beats]);

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
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && selectedBeats.length > 0) {
        handlePlayPause(selectedBeats[0]);
      }
      if (!inputFocused && (event.key === 'Delete' || event.key === 'Backspace') && selectedBeats.length > 0) {
        openConfirmModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBeats, handlePlayPause, inputFocused]);

  // Create virtualized beat list
  const virtualizedBeats = useMemo(() => {
    // Generate the visible beats plus spacers
    const result = [];
    
    // Add top spacer if needed
    if (visibleRange.start > 0) {
      result.push(
        <tr key="top-spacer" style={{ height: `${visibleRange.start * rowHeight}px` }} />
      );
    }
    
    // Add visible beats
  const visibleBeats = filteredAndSortedBeats.slice(visibleRange.start, visibleRange.end + 1);
  visibleBeats.forEach((beat, relativeIndex) => {
    const absoluteIndex = visibleRange.start + relativeIndex;
    const reversedIndex = filteredAndSortedBeats.length - 1 - absoluteIndex;
    const indexValue = playlistId ? absoluteIndex : reversedIndex;

    result.push(
      <React.Fragment key={beat.id}>
        {hoverIndex === absoluteIndex && hoverPosition === 'top' && <tr className="drop-line" />}
        <BeatRow
          beat={beat}
          currentBeat={currentBeat}
          index={indexValue}
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
        {hoverIndex === absoluteIndex && hoverPosition === 'bottom' && <tr className="drop-line" />}
      </React.Fragment>
    );
  });
    
    // Add bottom spacer if needed
    const remainingRows = filteredAndSortedBeats.length - visibleRange.end - 1;
    if (remainingRows > 0) {
      result.push(
        <tr key="bottom-spacer" style={{ height: `${remainingRows * rowHeight}px` }} />
      );
    }
    
    return result;
  }, [
    visibleRange, 
    rowHeight, 
    filteredAndSortedBeats, 
    hoverIndex, 
    hoverPosition, 
    currentBeat,
    handlePlayPause,
    handleUpdate,
    handleDelete, 
    selectedBeat, 
    isPlaying, 
    handleBeatClick, 
    selectedBeats, 
    openConfirmModal, 
    beats, 
    addToCustomQueue, 
    searchText, 
    mode, 
    activeContextMenu, 
    onBeatClick, 
    deleteMode, 
    onUpdateBeat, 
    onUpdate, 
    moveBeat, 
    playlistId, 
    setBeats
  ]);

  return (
    <div ref={containerRef} className="beat-list">
        <div
          className={classNames('beat-list__header', {
            'beat-list__header--focused': searchInputFocused,
            'beat-list__header--mobile': isMobileOrTablet(),
          })}
        >
        {
          headerContent ? (
            headerContent
          ) : (
            <h2 className='beat-list__title'>All Tracks</h2>
          )
        }
        <div className='beat-list__actions'>
          <SearchInput
            searchText={searchText}
            setSearchText={setSearchText}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            previousPage={previousPage}
            setPreviousPage={setPreviousPage}
            setSearchInputFocused={setSearchInputFocused}
          />
          <IconButton
            className='beat-list__action-button--edit'
            onClick={toggleEdit}
            text={mode === 'edit' ? 'Switch to Listen Mode' : 'Switch to Edit Mode'}
            tooltipPosition='left'
            ariaLabel={mode === 'edit' ? 'Switch to Listen Mode' : 'Switch to Edit Mode'}
          >
            {mode === 'edit' ? <IoPencil /> : <IoHeadsetSharp />}
          </IconButton>
        </div>
      </div>
      <FilterDropdown
        ref={filterDropdownRef} 
        filters={[
          { id: 'tierlist-filter', name: 'tierlist', label: 'Tierlist', options: [
            { id: 'M', name: 'M' },
            { id: 'G', name: 'G' },
            { id: 'S', name: 'S' },
            { id: 'A', name: 'A' },
            { id: 'B', name: 'B' },
            { id: 'C', name: 'C' },
            { id: 'D', name: 'D' },
            { id: 'E', name: 'E' },
            { id: 'F', name: 'F' },
          ] },
          { id: 'genre-filter', name: 'genres', label: 'Genres', options: genres },
          { id: 'mood-filter', name: 'moods', label: 'Moods', options: moods },
          { id: 'keyword-filter', name: 'keywords', label: 'Keywords', options: keywords },
          { id: 'feature-filter', name: 'features', label: 'Features', options: features },
          { id: 'hidden-filter', name: 'hidden', label: 'Hidden', options: [] }
        ]}
        onFilterChange={handleFilterChange}
      />
      {beats.length > 0 ? (
        filteredAndSortedBeats.length === 0 ? (
          <div className="placeholder-text">No tracks found</div>
        ) : (
          <div className='beat-list__table-container'>
            <table className="beat-list__table" ref={tableRef}>
              <TableHeader 
                onSort={onSort} 
                sortConfig={sortConfig} 
                mode={mode}
                topOffset={filterDropdownHeight} />

              <tbody ref={tbodyRef}>
                {virtualizedBeats}
              </tbody>
            </table>
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