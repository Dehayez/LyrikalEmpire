import React, { useEffect, useRef, useState } from 'react';
import { isMobileOrTablet } from '../../utils';
import { getBeats } from '../../services';
import { useHandleBeatClick, useBeatActions } from '../../hooks';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import BeatRow from './BeatRow';
import TableHeader from './TableHeader';
import { IconButton } from '../Buttons';
import { IoSearchSharp, IoCloseSharp, IoPencil, IoHeadsetSharp, IoLockClosedSharp } from "react-icons/io5";
import { toast, Slide } from 'react-toastify';
import './BeatList.scss';

const fetchBeats = async (handleUpdateAll) => {
  const fetchedBeats = await getBeats();
  handleUpdateAll(fetchedBeats);
};

const BeatList = ({ onPlay, selectedBeat, isPlaying, handleQueueUpdateAfterDelete, currentBeat, onSort, sortedBeats, sortConfig, addToCustomQueue, onBeatClick }) => {
  const tableRef = useRef(null);
  const searchInputRef = useRef(null);
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, beatsToDelete: [] });
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [isSearchVisible, setIsSearchVisible] = useState(localStorage.getItem('searchText') ? true : false);
  const [searchText, setSearchText] = useState(localStorage.getItem('searchText') || '');

  const [isHovering, setIsHovering] = useState(false);
  const { beats, handleUpdate, handleDelete, handleUpdateAll } = useBeatActions([], handleQueueUpdateAfterDelete);
  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef, currentBeat);
  const containerRef = useRef(null);
  const [headerOpacity, setHeaderOpacity] = useState(1);

  const filteredAndSortedBeats = sortedBeats.filter(beat => {
    const fieldsToSearch = [beat.title, beat.genre, beat.mood, beat.keywords];
    return fieldsToSearch.some(field => field && field.toLowerCase().includes(searchText.toLowerCase()));
  });

  const handlePlayPause = (beat) => {
    const isCurrentBeatPlaying = selectedBeat && selectedBeat.id === beat.id;
    onPlay(beat, !isCurrentBeatPlaying || !isPlaying, beats);
  };

  useEffect(() => {
    fetchBeats(handleUpdateAll);
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
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedBeats.length > 0) {
        setConfirmModalState({ isOpen: true, beatsToDelete: selectedBeats.map(beat => beat.id) });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBeats, handlePlayPause]);

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
      await Promise.all(confirmModalState.beatsToDelete.map(beatId => handleDelete(beatId)));
  
      const titlesToDelete = confirmModalState.beatsToDelete.map(beatId => {
        const beat = beats.find(b => b.id === beatId);
        return beat ? beat.title : 'Unknown Track';
      });
  
      const message = confirmModalState.beatsToDelete.length === 1
      ? <div><strong>{titlesToDelete[0]}</strong> has been deleted.</div>
      : <div><strong>{confirmModalState.beatsToDelete.length} tracks</strong> have been deleted.</div>;
    
    setConfirmModalState({ isOpen: false, beatsToDelete: [] });
    
    toast.dark(message, {
      autoClose: 3000,
      pauseOnFocusLoss: false,
      className: "Toastify__toast--warning",
    });
    }
  };

  const openConfirmModal = () => setConfirmModalState({ isOpen: true, beatsToDelete: selectedBeats.map(beat => beat.id) });

  const handleRightClick = (e, beat) => {
    e.preventDefault();
    if (!selectedBeats.some(selectedBeat => selectedBeat.id === beat.id)) {
      handleBeatClick(beat, e);
    }
  };

  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('mode');
    return saved || 'edit';
  });
  
  useEffect(() => {
    localStorage.setItem('mode', mode);
  }, [mode]);
  
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
    <div ref={containerRef} className="beat-list" style={{ overflowY: 'scroll', height: '100%' }}>
      <div className='beat-list__buffer'/>
      <div className="beat-list__header" style={{ opacity: headerOpacity }}>
        <h2 className='beat-list__title'>All Tracks</h2>
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
              {filteredAndSortedBeats.map((beat, index) => (
                <BeatRow
                  key={`${beat.id}-${index}`}
                  beat={beat}
                  currentBeat={currentBeat}
                  index={index}
                  handlePlayPause={handlePlayPause}
                  handleUpdate={handleUpdate}
                  handleDelete={handleDelete}
                  selectedBeat={selectedBeat}
                  hoveredBeat={hoveredBeat}
                  setHoveredBeat={setHoveredBeat}
                  isPlaying={isPlaying}
                  handleBeatClick={handleBeatClick}
                  selectedBeats={selectedBeats}
                  openConfirmModal={openConfirmModal}
                  beats={beats}
                  handleRightClick={handleRightClick}
                  addToCustomQueue={addToCustomQueue}
                  searchText={searchText}
                  mode={mode}
                  setActiveContextMenu={setActiveContextMenu}
                  activeContextMenu={activeContextMenu}
                  onBeatClick={onBeatClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {beats.length === 0 && <p className='beat-list__empty'>No tracks are added yet.</p>}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        message={`Are you sure you want to delete ${confirmModalState.beatsToDelete.length > 1 ? ` ${confirmModalState.beatsToDelete.length} beats` : 'this beat'}?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalState({ isOpen: false, beatsToDelete: [] })}
      />
    </div>
  );
};

export default BeatList;