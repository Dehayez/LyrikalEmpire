import React, { useEffect, useRef, useState } from 'react';
import { getBeats } from '../../services';
import { useHandleBeatClick, useBeatActions } from '../../hooks';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { IoSearchSharp, IoCloseSharp } from "react-icons/io5";
import BeatRow from './BeatRow';
import TableHeader from './TableHeader';
import './BeatList.scss';

const fetchBeats = async (handleUpdateAll) => {
  const fetchedBeats = await getBeats();
  handleUpdateAll(fetchedBeats);
};

const BeatList = ({ onPlay, selectedBeat, isPlaying, handleQueueUpdateAfterDelete, currentBeat, onSort, sortedBeats, sortConfig, addToCustomQueue }) => {
  const tableRef = useRef(null);
  const searchInputRef = useRef(null);
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, beatsToDelete: [] });
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const [isSearchVisible, setIsSearchVisible] = useState(localStorage.getItem('searchText') ? true : false);
  const [searchText, setSearchText] = useState(localStorage.getItem('searchText') || '');
  const [isHovering, setIsHovering] = useState(false);
  const { beats, handleUpdate, handleDelete, handleUpdateAll } = useBeatActions([], handleQueueUpdateAfterDelete);
  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef, currentBeat);

  useEffect(() => {
    fetchBeats(handleUpdateAll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target) && isSearchVisible && !searchText) {
        setIsSearchVisible(false);
      }
    };
  
    // Add click event listener
    document.addEventListener('mousedown', handleClickOutside);
  
    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchVisible, searchText]);

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

  const filteredAndSortedBeats = sortedBeats.filter(beat => {
    const fieldsToSearch = [beat.title, beat.genre, beat.mood, beat.keywords];
    return fieldsToSearch.some(field => field && field.toLowerCase().includes(searchText.toLowerCase()));
  });

  const handlePlayPause = (beat) => {
    const isCurrentBeatPlaying = selectedBeat && selectedBeat.id === beat.id;
    onPlay(beat, !isCurrentBeatPlaying || !isPlaying, beats);
  };

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

  const handleConfirm = async () => {
    if (confirmModalState.beatsToDelete.length > 0) {
      await Promise.all(confirmModalState.beatsToDelete.map(beatId => handleDelete(beatId)));
      setConfirmModalState({ isOpen: false, beatsToDelete: [] });
    }
  };

  const openConfirmModal = () => setConfirmModalState({ isOpen: true, beatsToDelete: selectedBeats.map(beat => beat.id) });

  const handleRightClick = (e, beat) => {
    e.preventDefault();
    if (!selectedBeats.some(selectedBeat => selectedBeat.id === beat.id)) {
      handleBeatClick(beat, e);
    }
  };

  return (
    <div className='beat-list'>
      <div className='beat-list__buffer'/>
      <div className='beat-list__header'>
        <h2 className='beat-list__title'>All Tracks</h2>
        <div className='beat-list__actions'>
          <div className='beat-list__search-container' onClick={(e) => e.stopPropagation()}>
            <div className={`beat-list__action-button beat-list__action-button--search icon-button ${searchText && !isSearchVisible ? 'beat-list__action-button--active' : ''}`} onClick={toggleSearchVisibility}>
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
        <div>
          <table className='beat-list__table' ref={tableRef}>
            <TableHeader onSort={onSort} sortConfig={sortConfig} />
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
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {beats.length === 0 && <p className='beat-list__empty'>No beats are added yet.</p>}
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