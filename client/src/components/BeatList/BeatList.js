import React, { useEffect, useRef, useState } from 'react';
import { getBeats } from '../../services';
import { useHandleBeatClick, useBeatActions } from '../../hooks';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { IoRefreshSharp, IoSearchSharp } from "react-icons/io5";
import BeatRow from './BeatRow';
import TableHeader from './TableHeader';
import './BeatList.scss';

const fetchBeats = async (handleUpdateAll) => {
  const fetchedBeats = await getBeats();
  handleUpdateAll(fetchedBeats);
};

const BeatList = ({ onPlay, selectedBeat, isPlaying, handleQueueUpdateAfterDelete, currentBeat, onSort, sortedBeats, sortConfig, addToCustomQueue  }) => {
  const tableRef = useRef(null);
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, beatsToDelete: [] });
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const [selectedBeatsForDeletion, setSelectedBeatsForDeletion] = useState([]);
  const { beats, handleUpdate, handleDelete, handleUpdateAll } = useBeatActions([], handleQueueUpdateAfterDelete);
  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef, currentBeat);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isInputOpen, setIsInputOpen] = useState(false); 
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchBeats(handleUpdateAll);
  }, []);

  useEffect(() => {
    if (isSearchVisible) {
      searchInputRef.current?.focus(); // Step 3: Focus the input when it becomes visible
    }
  }, [isSearchVisible]);

  const toggleSearchVisibility = () => {
    const willBeVisible = !isSearchVisible;
    setIsSearchVisible(willBeVisible);
    setIsInputOpen(willBeVisible); // Assuming toggling search visibility equates to opening/closing the input
  
    if (willBeVisible) {
      // Ensure the component updates with the search visible before trying to focus
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filteredBeats = searchText.length > 0 ? beats.filter(beat => {
    const fieldsToSearch = [beat.title, beat.genre, beat.mood, beat.keywords]; 
    return fieldsToSearch.some(field => field && field.toLowerCase().includes(searchText.toLowerCase()));
  }) : beats;

  const handlePlayPause = (beat) => {
    const isCurrentBeatPlaying = selectedBeat && selectedBeat.id === beat.id;
    onPlay(beat, !isCurrentBeatPlaying || !isPlaying, beats);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && selectedBeats.length > 0) {
        const beatToPlay = selectedBeats[0];
        handlePlayPause(beatToPlay);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBeats, handlePlayPause]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace' || event.keyCode === 46) && selectedBeats.length > 0) {
        setConfirmModalState({ isOpen: true, beatsToDelete: selectedBeats.map(beat => beat.id) });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBeats]);

  const handleConfirm = async () => {
    if (confirmModalState.beatsToDelete.length > 0) {
      await Promise.all(confirmModalState.beatsToDelete.map(beatId => handleDelete(beatId)));
      setConfirmModalState({ isOpen: false, beatsToDelete: [] });
      setSelectedBeatsForDeletion([]);
    }
  };

  const openConfirmModal = () => {
    setConfirmModalState({ isOpen: true, beatsToDelete: selectedBeats.map(beat => beat.id) });
  };
  
  const handleRightClick = (e, beat) => {
    e.preventDefault();
    if (!selectedBeats.some(selectedBeat => selectedBeat.id === beat.id)) {
      handleBeatClick(beat, e);
    }
  };

  return (
    <div className='beat-list'>
    <div className='beat-list__header'>
      <h2 className='beat-list__title'>All Tracks</h2>
      <div className='beat-list__actions'>
        <div className='beat-list__search-container'>
        <div className={`beat-list__action-button beat-list__action-button--search icon-button ${searchText && !isInputOpen ? 'beat-list__action-button--active' : ''}`} onClick={toggleSearchVisibility}>
            <IoSearchSharp/>
          </div>
          <input
          ref={searchInputRef}
            type="text"
            placeholder={isSearchVisible ? "Search beats..." : ""}
            value={searchText}
            onChange={handleSearchChange}
            className={`beat-list__search-input ${isSearchVisible ? 'visible' : ''}`}
          />
          {isSearchVisible && <span className="tooltip tooltip--left">Search</span>}
        </div>
      </div>
    </div>
      {beats.length > 0 && (
        <div>
        <table className='beat-list__table' ref={tableRef}>
          <TableHeader onSort={onSort} sortConfig={sortConfig} />
          <tbody>
          {filteredBeats.map((beat, index) => (
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
                activeContextMenu={activeContextMenu}
                setActiveContextMenu={setActiveContextMenu}
                addToCustomQueue={addToCustomQueue}
              />
            ))}
            </tbody>
          </table>
        </div>
      )}
      {beats.length === 0 && <p className='beat-list__warning'>No beats are added yet.</p>}
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