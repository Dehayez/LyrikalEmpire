import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { IoPencil, IoHeadsetSharp, IoPersonSharp } from 'react-icons/io5';
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

const BeatList = ({
  onPlay,
  selectedBeat,
  isPlaying,
  moveBeat,
  currentBeat,
  addToCustomQueue,
  onBeatClick,
  externalBeats,
  headerContent,
  onDeleteFromPlaylist,
  deleteMode = 'default',
  playlistName,
  playlistId,
  onUpdateBeat,
  onUpdate,
  setBeats,
}) => {
  // Refs
  const tableRef = useRef(null);
  const containerRef = useRef(null);
  const tbodyRef = useRef(null);
  const filterDropdownRef = useRef(null);

  // User & routing
  const { user } = useUser();
  const { username } = user;
  const navigate = useNavigate();
  const location = useLocation();

  // Context data
  const { genres, moods, keywords, features } = useData();
  const { setPlaylistId } = usePlaylist();
  const { allBeats, paginatedBeats, inputFocused, setRefreshBeats, currentBeats, setCurrentBeats } = useBeat();
  const beats = externalBeats || allBeats;

  // Local state
  const [searchText, setSearchText] = useState(() => getInitialState('searchText', ''));
  const urlKey = `currentPage_${location.pathname}`;
  const [currentPage, setCurrentPage] = useState(() => getInitialState(urlKey, 1));
  const [previousPage, setPreviousPage] = useState(currentPage);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  const [filteredBeats, setFilteredBeats] = useState([]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [rowHeight, setRowHeight] = useState(60);
  const [filterDropdownHeight, setFilterDropdownHeight] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState(() => getInitialState('selectedItems', {}).genres || []);
  const [selectedMood, setSelectedMood] = useState(() => getInitialState('selectedItems', {}).moods || []);
  const [selectedKeyword, setSelectedKeyword] = useState(() => getInitialState('selectedItems', {}).keywords || []);
  const [selectedFeature, setSelectedFeature] = useState(() => getInitialState('selectedItems', {}).features || []);
  const [selectedTierlist, setSelectedTierlist] = useState(() => getInitialState('selectedItems', {}).tierlist || []);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [mode, setMode] = useState(() => getInitialState('mode', 'listen'));
  const [isOpen, setIsOpen] = useState(false);
  const [beatsToDelete, setBeatsToDelete] = useState([]);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [showMessage, setShowMessage] = useState(false);

  // Derived & handlers
  const { sortedItems: sortedBeats, sortConfig, onSort } = useSort(filteredBeats);
  const filteredAndSortedBeats = useMemo(() => {
    return sortedBeats.filter((beat) => {
      const matchesSearch = beat.title?.toLowerCase().includes(searchText.toLowerCase());
      const matchesTier =
        selectedTierlist.length === 0 ||
        selectedTierlist.some((item) => beat.tierlist === item.id);
      return matchesSearch && matchesTier;
    });
  }, [sortedBeats, searchText, selectedTierlist]);

  const { selectedBeats, handleBeatClick } = useHandleBeatClick(beats, tableRef, currentBeat);
  const { handleUpdate, handleDelete } = useBeatActions();

  // Persist UI state
  useLocalStorageSync({ mode, searchText, urlKey, currentPage });

  // Update parent context
  useEffect(() => setCurrentBeats(filteredAndSortedBeats), [filteredAndSortedBeats, setCurrentBeats]);

  // Measure filter dropdown height
  useEffect(() => {
    const updateSize = () => {
      if (filterDropdownRef.current) {
        setFilterDropdownHeight(filterDropdownRef.current.offsetHeight + 60);
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (filterDropdownRef.current) observer.observe(filterDropdownRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      if (filterDropdownRef.current) observer.unobserve(filterDropdownRef.current);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

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

  // Virtual scroll calculation
  const calculateVisibleRows = useCallback(() => {
    if (!containerRef.current || !rowHeight) return;
    const scrollTop = containerRef.current.scrollTop;
    const viewH = containerRef.current.clientHeight;
    const buffer = 5;
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const end = Math.min(
      filteredAndSortedBeats.length - 1,
      Math.ceil((scrollTop + viewH) / rowHeight) + buffer
    );
    setVisibleRange({ start, end });
  }, [filteredAndSortedBeats.length, rowHeight]);

  // Measure row height
  useEffect(() => {
    if (tbodyRef.current?.firstChild) {
      const h = tbodyRef.current.firstChild.getBoundingClientRect().height;
      if (h) setRowHeight(h);
    }
  }, [paginatedBeats]);

  // Scroll & resize listeners
  useEffect(() => {
    calculateVisibleRows();
    const c = containerRef.current;
    if (c) c.addEventListener('scroll', calculateVisibleRows);
    window.addEventListener('resize', calculateVisibleRows);
    return () => {
      if (c) c.removeEventListener('scroll', calculateVisibleRows);
      window.removeEventListener('resize', calculateVisibleRows);
    };
  }, [calculateVisibleRows]);

  // Show initial placeholder
  useEffect(() => {
    const t = setTimeout(() => setShowMessage(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' && selectedBeats.length) {
        handlePlayPause(selectedBeats[0]);
      }
      if (!inputFocused && ['Delete','Backspace'].includes(e.key) && selectedBeats.length) {
        openConfirmModal();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedBeats, inputFocused]);

  // Handlers
  const handleFilterChange = (items, type) => {
    const setters = {
      genres: setSelectedGenre,
      moods: setSelectedMood,
      keywords: setSelectedKeyword,
      features: setSelectedFeature,
      tierlist: setSelectedTierlist,
    };
    setters[type]?.(items);
  };

  const handlePlayPause = useCallback((beat) => {
    const isCurr = selectedBeat?.id === beat.id;
    onPlay(beat, !isCurr || !isPlaying, filteredAndSortedBeats, true);
    setPlaylistId(playlistId);
  }, [selectedBeat, isPlaying, onPlay, filteredAndSortedBeats, playlistId]);

  const openConfirmModal = () => {
    setBeatsToDelete(selectedBeats.map((b) => b.id));
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (!beatsToDelete.length) return;
    if (onDeleteFromPlaylist) await onDeleteFromPlaylist(beatsToDelete);
    else await Promise.all(beatsToDelete.map((id) => handleDelete(id)));

    setRefreshBeats((p) => !p);
    setIsOpen(false);
    setBeatsToDelete([]);

    toast.dark(
      <div>
        {beatsToDelete.length > 1
          ? <strong>{beatsToDelete.length} tracks</strong>
          : <strong>{beatsToDelete.map((id) => beats.find((b) => b.id === id)?.title)}</strong>
        } has been {deleteMode === 'playlist' ? 'removed' : 'deleted'}.
      </div>,
      { autoClose: 3000, pauseOnFocusLoss: false, className: 'Toastify__toast--warning' }
    );
  };

  const toggleEdit = () => {
    const next = mode === 'listen' ? 'edit' : 'listen';
    setMode(next);
    toast.dismiss();
    setTimeout(() => {
      const icons = { listen: <IoHeadsetSharp />, edit: <IoPencil /> };
      toast(<>{next === 'listen'? 'Listen Mode Enabled':'Edit Mode Enabled'}</>, {
        position: 'bottom-center', autoClose: 600, hideProgressBar: true,
        closeButton: false, pauseOnFocusLoss: true,
        className: `toaster--mode ${!isMobileOrTablet()? 'toaster--mode--desktop':''}`,
        icon: icons[next], transition: Slide
      });
    }, 50);
  };

  // Virtualized rows
  const virtualizedBeats = useMemo(() => {
    const rows = [];
    if (visibleRange.start > 0) {
      rows.push(<tr key="top-spacer" style={{ height: `${visibleRange.start * rowHeight}px` }} />);
    }
    const slice = filteredAndSortedBeats.slice(visibleRange.start, visibleRange.end + 1);
    slice.forEach((beat, i) => {
      const idx = playlistId ? visibleRange.start + i : filteredAndSortedBeats.length - 1 - (visibleRange.start + i);
      if (hoverIndex === visibleRange.start + i && hoverPosition==='top') rows.push(<tr className="drop-line" key={`drop-top-${beat.id}`} />);
      rows.push(
        <BeatRow key={beat.id}
          beat={beat} currentBeat={currentBeat} index={idx}
          handlePlayPause={handlePlayPause} handleUpdate={handleUpdate} handleDelete={handleDelete}
          selectedBeat={selectedBeat} isPlaying={isPlaying} handleBeatClick={handleBeatClick}
          selectedBeats={selectedBeats} openConfirmModal={openConfirmModal}
          beats={beats} addToCustomQueue={addToCustomQueue} searchText={searchText}
          mode={mode} setActiveContextMenu={setActiveContextMenu} activeContextMenu={activeContextMenu}
          onBeatClick={onBeatClick} deleteMode={deleteMode} onUpdateBeat={onUpdateBeat}
          onUpdate={onUpdate} moveBeat={moveBeat} playlistId={playlistId} setBeats={setBeats}
          setHoverIndex={setHoverIndex} setHoverPosition={setHoverPosition}
        />
      );
      if (hoverIndex === visibleRange.start + i && hoverPosition==='bottom') rows.push(<tr className="drop-line" key={`drop-bottom-${beat.id}`} />);
    });
    const remaining = filteredAndSortedBeats.length - visibleRange.end - 1;
    if (remaining > 0) rows.push(<tr key="bottom-spacer" style={{ height: `${remaining * rowHeight}px` }} />);
    return rows;
  }, [filteredAndSortedBeats, visibleRange, rowHeight, hoverIndex, hoverPosition]);

  return (
    <div ref={containerRef} className="beat-list">
      <div className={classNames('beat-list__header', {
        'beat-list__header--focused': searchInputFocused,
        'beat-list__header--mobile': isMobileOrTablet(),
      })}>
        {headerContent || <h2 className="beat-list__title">All Tracks</h2>}
        <div className="beat-list__actions">
          <SearchInput
            searchText={searchText} setSearchText={setSearchText}
            currentPage={currentPage} setCurrentPage={setCurrentPage}
            previousPage={previousPage} setPreviousPage={setPreviousPage}
            setSearchInputFocused={setSearchInputFocused}
          />
          <IconButton
            className="beat-list__action-button--edit"
            onClick={toggleEdit}
            text={mode==='edit'?'Switch to Listen Mode':'Switch to Edit Mode'}
            tooltipPosition="left"
            ariaLabel={mode==='edit'?'Switch to Listen Mode':'Switch to Edit Mode'}
          >{mode==='edit'?<IoPencil/>:<IoHeadsetSharp/>}
          </IconButton>
          <IconButton
            className="beat-list__action-button--profile"
            onClick={()=>navigate('/profile')}
            text={username}
            tooltipPosition="left"
            ariaLabel={`Go to ${username}'s Profile`}
          ><IoPersonSharp/></IconButton>
        </div>
      </div>

      <FilterDropdown
        ref={filterDropdownRef}
        filters={[
          { id:'tierlist-filter', name:'tierlist', label:'Tierlist', options: [
            {id:'M',name:'M'},{id:'G',name:'G'},{id:'S',name:'S'},{id:'A',name:'A'},
            {id:'B',name:'B'},{id:'C',name:'C'},{id:'D',name:'D'},{id:'E',name:'E'},{id:'F',name:'F'}
          ]},
          { id:'genre-filter', name:'genres', label:'Genres', options:genres },
          { id:'mood-filter', name:'moods', label:'Moods', options:moods },
          { id:'keyword-filter', name:'keywords', label:'Keywords', options:keywords },
          { id:'feature-filter', name:'features', label:'Features', options:features }
        ]}
        onFilterChange={handleFilterChange}
      />

      {beats.length > 0 ? (
        filteredAndSortedBeats.length === 0 ? (
          <div className="placeholder-text">No tracks found</div>
        ) : (
          <div className="beat-list__table-container" style={{ top: filterDropdownHeight }}>
            <table className="beat-list__table" ref={tableRef}>
              <TableHeader onSort={onSort} sortConfig={sortConfig} mode={mode} />
              <tbody ref={tbodyRef}>{virtualizedBeats}</tbody>
            </table>
          </div>
        )
      ) : (
        showMessage && <p className="placeholder-text">No tracks are added yet.</p>
      )}

      <ConfirmModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={`${deleteMode==='playlist'?'Remove':'Delete'} ${beatsToDelete.length>1?'tracks':'track'}`}
        message={<span>Are you sure you want to {deleteMode==='playlist'?'remove':'delete'} {beatsToDelete.length>1?`${beatsToDelete.length} tracks`:'this track'}{deleteMode==='playlist' && <> from <strong>{playlistName}</strong></>}?</span>}
        confirmButtonText={deleteMode==='playlist'?'Remove':'Delete'}
        cancelButtonText="Cancel"
        onConfirm={handleConfirm}
        onCancel={()=>setIsOpen(false)}
      />
    </div>
  );
};

export default BeatList;
