import React, { useRef, useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useLocation } from 'react-router-dom';
import { IoRemoveCircleOutline, IoAddSharp, IoListSharp, IoEllipsisHorizontal, IoTrashBinOutline } from "react-icons/io5";
import classNames from 'classnames';

import { useBpmHandlers } from '../../hooks';
import { addBeatsToPlaylist, getBeatsByPlaylistId } from '../../services';
import { isMobileOrTablet } from '../../utils';
import { usePlaylist, useBeat, useData } from '../../contexts';

import BeatAnimation from './BeatAnimation';
import PlayPauseButton from './PlayPauseButton';
import { ContextMenu } from '../ContextMenu';
import { Highlight } from '../Highlight';
import { SelectableInput } from '../Inputs';

import './BeatRow.scss';

const BeatRow = ({
  beat, index, moveBeat, handlePlayPause, handleUpdate, isPlaying, onBeatClick,
  selectedBeats = [], handleBeatClick, 
  openConfirmModal, beats, activeContextMenu, setActiveContextMenu, currentBeat, addToCustomQueue, searchText, mode, deleteMode, onUpdateBeat, onUpdate, playlistId, setBeats, setHoverIndex, setHoverPosition
}) => {
  const ref = useRef(null);
  const location = useLocation();
  const { genres, moods, keywords, features } = useData();
  const { setHoveredBeat } = useBeat();
  const { playlists,isSamePlaylist } = usePlaylist();

  const beatIndices = beats.reduce((acc, b, i) => ({ ...acc, [b.id]: i }), {});
  const isSelected = selectedBeats.map(b => b.id).includes(beat.id);
  const hasSelectedBefore = selectedBeats.some(b => beatIndices[b.id] === beatIndices[beat.id] - 1);
  const hasSelectedAfter = selectedBeats.some(b => beatIndices[b.id] === beatIndices[beat.id] + 1);
  const isMiddle = hasSelectedBefore && hasSelectedAfter;

  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);
  const { handleOnKeyDown, handleBpmBlur } = useBpmHandlers(handleUpdate, beat);
  const toDragAndDrop = location.pathname !== '/' && mode === 'lock';
  const [tierlist, setTierlist] = useState(beat.tierlist || '');
  const [isInputFocused, setInputFocused] = useState(false);
  const [disableFocus, setDisableFocus] = useState(false);

  useEffect(() => {
    if (mode !== 'edit') {
      setDisableFocus(true);
    } else {
      setDisableFocus(false);
    }
  }, [mode]);
  
  const urlKey = `currentPage_${location.pathname}`;
  const [currentPage, setCurrentPage] = useState(() => parseInt(localStorage.getItem(urlKey), 10) || 1);
  const itemsPerPage = 7;

  const deleteText = selectedBeats.length > 1
    ? deleteMode === 'playlist'
        ? `Remove ${selectedBeats.length} tracks`
        : `Delete ${selectedBeats.length} tracks`
    : deleteMode === 'playlist'
        ? 'Remove from playlist'
        : 'Delete this track';

  const beatRowClasses = classNames({
    'beat-row': true,
    'beat-row--selected-middle': isSelected && isMiddle,
    'beat-row--selected-bottom': isSelected && !isMiddle && hasSelectedBefore,
    'beat-row--selected-top': isSelected && !isMiddle && hasSelectedAfter,
    'beat-row--selected': isSelected && !isMiddle && !hasSelectedBefore && !hasSelectedAfter,
    'beat-row--playing': currentBeat && beat.id === currentBeat.id && isSamePlaylist,
  });

  const fetchBeats = async (playlistId, setBeats) => {
    try {
      const beatsData = await getBeatsByPlaylistId(playlistId);
      const sortedBeats = beatsData.sort((a, b) => a.beat_order - b.beat_order);
      setBeats(sortedBeats);
    } catch (error) {
      console.error('Error fetching beats:', error);
    }
  };

  const calculateActualIndex = (index) => {
    return (currentPage - 1) * itemsPerPage + index;
  };

  const [{ isDragging }, drag] = useDrag({
    type: 'BEAT',
    item: { type: 'BEAT', id: beat.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => toDragAndDrop,
  });

  const [, drop] = useDrop({
    accept: 'BEAT',
    hover(item, monitor) {
      if (!toDragAndDrop) return;
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
    
      const clientOffset = monitor.getClientOffset();
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    
      if (hoverClientY < hoverMiddleY) {
        setHoverPosition('top');
        setHoverIndex(hoverIndex);
      } else {
        setHoverPosition('bottom');
        setHoverIndex(hoverIndex);
      }
    
      if (dragIndex === hoverIndex) {
        return;
      }
    
      if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
        moveBeat(dragIndex, hoverIndex);
        item.index = hoverIndex;
        setHoverIndex(hoverIndex);
        return;
      }
    
      if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
        moveBeat(dragIndex, hoverIndex);
        item.index = hoverIndex;
        setHoverIndex(hoverIndex);
        return;
      }
    },
    drop: () => {
      if (!toDragAndDrop) return;
      fetchBeats(playlistId, setBeats);
      setHoverIndex(null);
    },
  });

  if (toDragAndDrop) {
    drag(drop(ref));
  }

  useEffect(() => {
    const contextMenuElement = document.getElementById('context-menu');
    let hideTimeoutId;
  
    const toggleScroll = (disable) => document.body.classList.toggle('no-scroll', disable);
    const manageContextMenuVisibility = (show) => {
      window[`${show ? 'add' : 'remove'}EventListener`]('click', hideContextMenu);
      toggleScroll(show);
      if (contextMenuElement) {
        ['mouseleave', 'mouseenter'].forEach(event => {
          contextMenuElement[`${show ? 'add' : 'remove'}EventListener`](event, eventHandlers[event]);
        });
      }
    };
  
    const hideContextMenu = () => setActiveContextMenu(null);
    const eventHandlers = {
      mouseleave: () => hideTimeoutId = setTimeout(hideContextMenu, 0),
      mouseenter: () => clearTimeout(hideTimeoutId)
    };
  
    manageContextMenuVisibility(activeContextMenu === beat.id);
  
    return () => manageContextMenuVisibility(false);
  }, [activeContextMenu, beat.id]);

  const handleAddToCustomQueueClick = () => {
    addToCustomQueue(selectedBeats);
  };

  const handleInputChange = (property, value) => {
    onUpdateBeat(beat.id, { [property]: value });
  };
  
  const handleTierlistChange = (e) => {
    const newTierlist = e.target.value;
    setTierlist(newTierlist);
    handleUpdate(beat.id, 'tierlist', newTierlist);
  };

  const handleFocus = () => setInputFocused(true);

  const handleBlur = (id, field, value) => {
    setInputFocused(false);
    handleUpdate(id, field, value);
  };

  const handleClick = () => {
    if (onBeatClick) {
      onBeatClick(beat);
    }
  };

  const handleMenuClick = (e, beat) => {
    e.preventDefault();
    if (!selectedBeats.some(selectedBeat => selectedBeat.id === beat.id)) {
      handleBeatClick(beat, e);
    }
  };

  const handleMenuButtonClick = (e, beat) => {
    e.stopPropagation();
    handleMenuClick(e, beat);
    if (isMobileOrTablet()) {
      setActiveContextMenu(beat.id);
    } else {
      if (activeContextMenu === beat.id) {
        setActiveContextMenu(null);
      } else {
        setActiveContextMenu(beat.id);
        const buttonRect = e.currentTarget.getBoundingClientRect();
        const contextMenuWidth = 240;
        const offsetY = 24;
        let calculatedX = buttonRect.left;
        let calculatedY = buttonRect.top + offsetY;
        if (calculatedX + contextMenuWidth > window.innerWidth) {
          calculatedX = window.innerWidth - contextMenuWidth;
        }
        if (calculatedX < 0) {
          calculatedX = 0;
        }
        setContextMenuX(calculatedX);
        setContextMenuY(calculatedY);
      }
    }
  };

  const handleAddBeatToPlaylist = async (playlistId, beatIds) => {
    try {
      await addBeatsToPlaylist(playlistId, beatIds);
    } catch (error) {
      console.error('Error adding beats to playlist:', error);
    }
  };

  function formatDuration(durationInSeconds) {
    const totalSeconds = Math.round(durationInSeconds);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <tr
      ref={ref} 
      className={`${beatRowClasses} ${isInputFocused ? 'beat-row--focused' : ''}${isDragging ? 'beat-row--selected' : ''}`}
      key={beatRowClasses}
      onClick={mode !== "edit" ? (isMobileOrTablet() ? handleClick : (e) => handleBeatClick(beat, e)) : undefined}
      onMouseEnter={(e) => { 
        if (!isMobileOrTablet()) { 
          e.currentTarget.querySelectorAll('.interactive-button').forEach(button => { 
            button.style.opacity = 1; 
          }); 
          setHoveredBeat(beat.id); 
        } 
      }}
      onMouseLeave={(e) => { 
        if (!isMobileOrTablet()) { 
          e.currentTarget.querySelectorAll('.interactive-button').forEach(button => { 
            button.style.opacity = 0; 
          }); 
          setHoveredBeat(null); 
        } 
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        handleMenuClick(e, beat);
        setActiveContextMenu(beat.id);
        setContextMenuX(e.clientX);
        setContextMenuY(e.clientY);
      }}
    >
      {!(mode === 'lock' && isMobileOrTablet()) && (
        <td className="beat-row__number">
          <div className="beat-row__button-cell">
            <BeatAnimation 
              beat={beat} 
              currentBeat={currentBeat} 
              isPlaying={isPlaying} 
              index={calculateActualIndex(index)}
            />
            <PlayPauseButton 
              beat={beat} 
              handlePlayPause={handlePlayPause}
              currentBeat={currentBeat} 
              isPlaying={isPlaying} 
            />
          </div>
        </td>
      )}
      <td className="beat-row__data">
        {!isInputFocused && <Highlight text={beat.title} highlight={searchText} />}
        {mode === 'edit' ? 
          <input 
            id={`beat-title-input-${beat.id}`}
            className='beat-row__input beat-row__input--title'
            type="text"
            defaultValue={beat.title} 
            onFocus={handleFocus}
            onBlur={(e) => {
              handleInputChange('title', e.target.value);
              handleBlur(beat.id, 'title', e.target.value);
            }}
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={(e) => e.stopPropagation()}
            spellCheck="false"
          />
        : 
          <div className='beat-row__input beat-row__input--title beat-row__input--static'>{beat.title}</div> 
        }
      </td>
      {mode !== 'lock' && (
        <>
          <td className="beat-row__data">
             <SelectableInput
              associationType="genres"
              items={genres}
              beatId={beat.id}
              headerIndex='2'
              disableFocus={disableFocus}
            />
          </td>
          <td className="beat-row__data">
            {mode === 'edit' ? 
              <input 
                id={`beat-bpm-input-${beat.id}`}
                className='beat-row__input beat-row__input--bpm' 
                type="text" 
                defaultValue={beat.bpm} 
                onKeyDown={handleOnKeyDown}
                onBlur={(e) => {
                  handleInputChange('bpm', e.target.value);
                  handleBpmBlur(e);
                }}
                onClick={(e) => e.stopPropagation()}
                spellCheck="false"
              />
            : 
              <div className='beat-row__input beat-row__input--static beat-row__input--bpm'>{beat.bpm}</div> 
            }
          </td>
          <td className="beat-row__data">
            {mode === 'edit' ? 
              <div className="form-group">
                <div className="select-wrapper">
                    <select 
                      id={`beat-tierlist-select-${beat.id}`}
                      className="select-wrapper__select" 
                      value={tierlist}
                      onChange={(e) => {
                        handleInputChange('tierlist', e.target.value);
                        handleTierlistChange(e);
                      }}
                      onFocus={(e) => e.target.style.color = 'white'}
                      onBlur={(e) => e.target.style.color = tierlist ? 'white' : 'grey'}
                      onClick={(e) => e.stopPropagation()}
                      style={{color: tierlist ? 'white' : 'grey'}}
                    >
                      <option value=""></option>
                      <option value="G">G</option>
                      <option value="S">S</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="F">F</option>
                    </select>
                  </div>
              </div>
            : 
              <div className='beat-row__input beat-row__input--static'>{beat.tierlist}</div> 
            }
          </td>
          <td className="beat-row__data">
              <SelectableInput
                associationType="moods"
                items={moods}
                beatId={beat.id}
                headerIndex='5'
                disableFocus={disableFocus}
              />
          </td>
          <td className="beat-row__data">
              <SelectableInput
                associationType="keywords"
                items={keywords}
                beatId={beat.id}
                headerIndex='6'
                disableFocus={disableFocus}
              />
          </td> 
          <td className="beat-row__data">
              <SelectableInput
                associationType="features"
                items={features}
                beatId={beat.id}
                headerIndex='7'
                disableFocus={disableFocus}
              />
          </td>
        </>
      )}
      {!(isMobileOrTablet() && mode === 'lock') && (
        <td className='beat-row__data'>{formatDuration(beat.duration)}</td>
      )}
      <td className="beat-row__data">
        <button 
          className={`icon-button icon-button--menu interactive-button ${isMobileOrTablet() ? 'icon-button--menu--mobile' : ''}`} 
          onClick={(e) => handleMenuButtonClick(e, beat)}
        >
          <IoEllipsisHorizontal fontSize={24} />
        </button>
      </td>
      {activeContextMenu === beat.id && (
        <td className="beat-row__data">
         <ContextMenu
            beat={beat}
            position={{ top: contextMenuY, left: contextMenuX }}
            setActiveContextMenu={setActiveContextMenu}
            items={[
              {
                icon: IoAddSharp,
                iconClass: 'add-playlist',
                text: 'Add to playlist',
                buttonClass: 'add-playlist',
                subItems: playlists.map(playlist => ({
                  text: playlist.title,
                  onClick: () => {
                    const selectedBeatIds = selectedBeats.map(beat => beat.id);
                    handleAddBeatToPlaylist(playlist.id, selectedBeatIds);
                  },
                })),
              },
              {
                icon: IoListSharp,
                iconClass: 'add-queue',
                text: 'Add to queue',
                buttonClass: 'add-queue',
                onClick: handleAddToCustomQueueClick,
              },
              {
                icon: deleteMode === "playlist" ? IoTrashBinOutline : IoRemoveCircleOutline,
                iconClass: 'delete',
                text: deleteText,
                buttonClass: 'delete',
                onClick: () => openConfirmModal(beat.id),
              },
            ]}
          />
        </td>
      )}
      </tr>
    );
  };

  export default BeatRow;