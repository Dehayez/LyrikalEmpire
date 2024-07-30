import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { IoSearchSharp, IoCloseSharp, IoPencil, IoHeadsetSharp, IoLockClosedSharp, IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import { toast, Slide } from 'react-toastify';

import { isMobileOrTablet, sortBeats } from '../../utils';
import { getBeats } from '../../services';
import { useHandleBeatClick, useBeatActions } from '../../hooks';
import { usePlaylist, useBeat } from '../../contexts';

import ConfirmModal from '../ConfirmModal/ConfirmModal';
import BeatRow from './BeatRow';
import TableHeader from './TableHeader';
import { IconButton } from '../Buttons';
import Button from '../Buttons';

import './BeatList.scss';

const BeatList = ({ onPlay, selectedBeat, isPlaying, moveBeat, handleQueueUpdateAfterDelete, currentBeat, onSort, sortedBeats, sortConfig, addToCustomQueue, onBeatClick, externalBeats = [], shouldFetchBeats = true, headerContent, onDeleteFromPlaylist, deleteMode = 'default', playlistName, playlistId, onUpdateBeat, onUpdate, setBeats }) => {
  const { setPlaylistId } = usePlaylist();
  const { isInputFocused, setInputFocused } = useBeat();

  const location = useLocation();
  const urlKey = `currentPage_${location.pathname}`;

  const tableRef = useRef(null);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);

  const [hasFetched, setHasFetched] = useState(false);
  const isExternalBeats = externalBeats.length > 0;
  const initialBeats = isExternalBeats ? externalBeats : [];
  const { beats, handleUpdate, handleDelete, handleUpdateAll } = useBeatActions(initialBeats, handleQueueUpdateAfterDelete);
  const beatsToFilter = isExternalBeats ? externalBeats : beats;

  const [hoverIndex, setHoverIndex] = useState(null);
  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef, currentBeat);

  const [showMessage, setShowMessage] = useState(false);
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, beatsToDelete: [] });
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [hoverPosition, setHoverPosition] = useState(null);

  const [isSearchVisible, setIsSearchVisible] = useState(localStorage.getItem('searchText') ? true : false);
  const [searchText, setSearchText] = useState(localStorage.getItem('searchText') || '');
  
  const [mode, setMode] = useState(() => {const saved = localStorage.getItem('mode');return saved || 'edit';});
  
  const filteredAndSortedBeats = useMemo(() => {
    const filteredBeats = beatsToFilter.filter(beat => {
      const fieldsToSearch = [beat.title, beat.genre, beat.mood, beat.keywords];
      return fieldsToSearch.some(field => field && field.toLowerCase().includes(searchText.toLowerCase()));
    });
    
    return sortBeats(filteredBeats, sortConfig);
  }, [beatsToFilter, searchText, sortConfig]);
  
  const [currentPage, setCurrentPage] = useState(() => parseInt(localStorage.getItem(urlKey), 10) || 1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredAndSortedBeats.length / itemsPerPage);
  const currentBeats = filteredAndSortedBeats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePlayPause = useCallback((beat) => {
    const isCurrentBeatPlaying = selectedBeat && selectedBeat.id === beat.id;
    onPlay(beat, !isCurrentBeatPlaying || !isPlaying, beats);
    setPlaylistId(playlistId);
  }, [selectedBeat, isPlaying, onPlay, beats, playlistId, setPlaylistId]);

  useEffect(() => {
    localStorage.setItem(urlKey, currentPage);
  }, [currentPage, urlKey]);

  
  const handleNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };
  
  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 100); 

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchAndSetBeats = async () => {
      if (shouldFetchBeats && !isExternalBeats && !hasFetched) {
        const fetchedBeats = await getBeats();
        handleUpdateAll(fetchedBeats);
        setHasFetched(true);
      }
    };
  
    fetchAndSetBeats();
  }, [shouldFetchBeats, isExternalBeats, handleUpdateAll, hasFetched]);

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
        setConfirmModalState({ isOpen: true, beatsToDelete: selectedBeats.map(beat => beat.id) });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBeats, handlePlayPause]);
  
  useEffect(() => {
    localStorage.setItem('mode', mode);
  }, [mode]);

  const toggleSearchVisibility = () => {
    const willBeVisible = !isSearchVisible;
    setIsSearchVisible(willBeVisible);
    if (willBeVisible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else if (!isHovering) {
      setIsSearchVisible(false);
    }
  };

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchText(newValue);
    localStorage.setItem('searchText', newValue);
  };

  const handleConfirm = async () => {
    if (confirmModalState.beatsToDelete.length > 0) {
      if (onDeleteFromPlaylist) {
        await onDeleteFromPlaylist(confirmModalState.beatsToDelete);
      } else {
        await Promise.all(confirmModalState.beatsToDelete.map(beatId => handleDelete(beatId)));
      }
  
      const titlesToDelete = confirmModalState.beatsToDelete.map(beatId => {
        const beat = beats.find(b => b.id === beatId);
        return beat ? beat.title : 'Unknown Track';
      });
  
      const message = confirmModalState.beatsToDelete.length === 1
      ? <div><strong>{titlesToDelete[0]}</strong> has been {deleteMode === 'playlist' ? <>removed from <strong>{playlistName}</strong></> : 'deleted'}.</div>
      : <div><strong>{confirmModalState.beatsToDelete.length} tracks</strong> have been {deleteMode === 'playlist' ? <>removed from <strong>{playlistName}</strong></> : 'deleted'}.</div>;
    
    setConfirmModalState({ isOpen: false, beatsToDelete: [] });
    
    toast.dark(message, {
      autoClose: 3000,
      pauseOnFocusLoss: false,
      className: "Toastify__toast--warning",
    });
    }
  };

  const openConfirmModal = () => setConfirmModalState({ isOpen: true, beatsToDelete: selectedBeats.map(beat => beat.id) });
  
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
          <IconButton className={'beat-list__action-button--edit'} onClick={toggleEdit}>
            {mode === 'edit' ? 
            <>
              {!isMobileOrTablet() && (
                <span className="tooltip tooltip--left tooltip--edit">Switch to Listen Mode</span>
              )}
              <IoPencil/> 
            </>
            : mode === 'listen' ?
            <>
              {!isMobileOrTablet() && (
              <span className="tooltip tooltip--left tooltip--listen">Switch to Lock Mode</span>
            )}
              <IoHeadsetSharp/>
            </>
            :
            <>
              {!isMobileOrTablet() && (
              <span className="tooltip tooltip--left tooltip--mixed">Switch to Edit Mode</span>
            )}
              <IoLockClosedSharp/>
            </>
            }
          </IconButton>
          <div className='beat-list__search-container' onClick={(e) => e.stopPropagation()}>
          <div className={`beat-list__action-button beat-list__action-button--search icon-button ${searchText && !isSearchVisible ? 'beat-list__action-button--search--active' : ''} ${!isSearchVisible ? 'beat-list__action-button--search--closed' : ''}`} onClick={toggleSearchVisibility}>
            {!isMobileOrTablet() && (
              <span className="tooltip tooltip--left tooltip--search">Search in tracks</span>
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
            />
           {isSearchVisible && searchText && (
              <div className="beat-list__action-button beat-list__action-button--clear" onClick={() => {
                setSearchText('');
                localStorage.setItem('searchText', '');
              }}>
                <IoCloseSharp />
              </div>
            )}
          </div>
        </div>
      </div>
      {beats.length > 0 && (
        <div className='beat-list__table-container'>
          <table className={`beat-list__table ${mode === 'lock' ? 'beat-list__table--lock' : ''}`} ref={tableRef}>
            <TableHeader onSort={onSort} sortConfig={sortConfig} mode={mode} />
            <tbody>
              {currentBeats.map((beat, index) => (
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
          <div className="pagination-controls">
            <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
              <IoChevronBackSharp fontSize={20}/>
            </Button>
              <span className="pagination-controls__text">Page {currentPage} of {totalPages}</span>
            <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
              <IoChevronForwardSharp fontSize={20}/>  
            </Button>
          </div>
        </div>
      )}
     
     {beats.length === 0 && showMessage && (
        <p className='beat-list__empty'>No tracks are added yet.</p>
      )}
      <ConfirmModal 
        isOpen={confirmModalState.isOpen} 
        title={`${deleteMode === 'playlist' ? 'Remove' : 'Delete'} ${confirmModalState.beatsToDelete.length > 1 ? `tracks` : 'track'}`}
        message={<span>Are you sure you want to {deleteMode === 'playlist' ? 'remove' : 'delete'} {confirmModalState.beatsToDelete.length > 1 ? `${confirmModalState.beatsToDelete.length} tracks` : 'this track'}{deleteMode === 'playlist' ? <> from <strong>{playlistName}</strong></> : ''}?</span>}
        confirmButtonText={`${deleteMode === 'playlist' ? 'Remove' : 'Delete'}`}
        cancelButtonText="Cancel" 
        onConfirm={handleConfirm} 
        onCancel={() => setConfirmModalState({ ...confirmModalState, isOpen: false })}
      />
    </div>
  );
};

export default BeatList;