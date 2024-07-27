import React, { useRef, useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import { IoRemoveCircleOutline, IoAddSharp, IoListSharp, IoEllipsisHorizontal, IoTrashBinOutline } from "react-icons/io5";
import { useBpmHandlers, useSelectableList } from '../../hooks';
import { getGenres, getKeywords, getMoods } from '../../services';
import { addBeatsToPlaylist, getPlaylists } from '../../services/playlistService';
import { isMobileOrTablet } from '../../utils';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { useBeat } from '../../contexts/BeatContext';
import BeatAnimation from './BeatAnimation';
import PlayPauseButton from './PlayPauseButton';
import { ContextMenu } from '../ContextMenu';
import { Highlight } from '../Highlight';
import { SelectableInput } from '../Inputs';
import './BeatRow.scss';

const BeatRow = ({
  beat, index, moveBeat, handlePlayPause, handleUpdate, isPlaying, onBeatClick,
  selectedBeats = [], handleBeatClick, 
  openConfirmModal, beats, activeContextMenu, setActiveContextMenu, currentBeat, addToCustomQueue, searchText, mode, deleteMode, onUpdateBeat, onUpdate
}) => {
  const ref = React.useRef(null);
  const beatIndices = beats.reduce((acc, b, i) => ({ ...acc, [b.id]: i }), {});
  const isSelected = selectedBeats.map(b => b.id).includes(beat.id);
  const hasSelectedBefore = selectedBeats.some(b => beatIndices[b.id] === beatIndices[beat.id] - 1);
  const hasSelectedAfter = selectedBeats.some(b => beatIndices[b.id] === beatIndices[beat.id] + 1);
  const isMiddle = hasSelectedBefore && hasSelectedAfter;
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);
  const { handleOnKeyDown, handleBpmBlur } = useBpmHandlers(handleUpdate, beat);
  const [tierlist, setTierlist] = useState(beat.tierlist || '');
  const deleteText = selectedBeats.length > 1
    ? deleteMode === 'playlist'
        ? `Remove ${selectedBeats.length} tracks from playlist`
        : `Delete ${selectedBeats.length} tracks`
    : deleteMode === 'playlist'
        ? 'Remove this track from playlist'
        : 'Delete this track';
  const [isInputFocused, setInputFocused] = useState();
  const [playlists, setPlaylists] = useState([]);
  const { isSamePlaylist } = usePlaylist();
  const { hoveredBeat, setHoveredBeat } = useBeat();

  const beatRowClasses = classNames({
    'beat-row': true,
    'beat-row--selected-middle': isSelected && isMiddle,
    'beat-row--selected-bottom': isSelected && !isMiddle && hasSelectedBefore,
    'beat-row--selected-top': isSelected && !isMiddle && hasSelectedAfter,
    'beat-row--selected': isSelected && !isMiddle && !hasSelectedBefore && !hasSelectedAfter,
    'beat-row--playing': currentBeat && beat.id === currentBeat.id && isSamePlaylist,
  });

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await getPlaylists();
        setPlaylists(data);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    fetchPlaylists();
  }, []);

  const [{ isDragging }, drag] = useDrag({
    type: 'BEAT',
    item: { type: 'BEAT', id: beat.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'BEAT',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveBeat(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  useEffect(() => {
    console.log(isDragging);
  }, [isDragging]);

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

  const {
    selectedItem: selectedGenre,
    filteredItems: filteredGenres,
    showItems: showGenres,
    handleItemChange: handleGenreChange,
    handleItemToggle: handleGenreToggle,
    handleItemFocus: handleGenreFocus,
    handleItemBlur: handleGenreBlur
  } = useSelectableList(getGenres, beat.genre);

  useEffect(() => {
    if (selectedGenre) {
      handleUpdate(beat.id, 'genre', selectedGenre);
      onUpdate(beat.id, 'genre', selectedGenre);
    }
  }, [selectedGenre]);

  const {
    selectedItem: selectedMood,
    filteredItems: filteredMoods,
    showItems: showMoods,
    handleItemChange: handleMoodChange,
    handleItemToggle: handleMoodToggle,
    handleItemFocus: handleMoodFocus,
    handleItemBlur: handleMoodBlur
  } = useSelectableList(getMoods, beat.mood);

  useEffect(() => {
    if (selectedMood) {
      handleUpdate(beat.id, 'mood', selectedMood);
      onUpdate(beat.id, 'mood', selectedMood);
    }
  }, [selectedMood]);

  const {
    selectedItem: selectedKeyword,
    filteredItems: filteredKeywords,
    showItems: showKeywords,
    handleItemChange: handleKeywordChange,
    handleItemToggle: handleKeywordToggle,
    handleItemFocus: handleKeywordFocus,
    handleItemBlur: handleKeywordBlur
  } = useSelectableList(getKeywords, beat.keywords);

  useEffect(() => {
    if (selectedKeyword) {
      handleUpdate(beat.id, 'keywords', selectedKeyword);
      onUpdate(beat.id, 'keywords', selectedKeyword);
    }
  }, [selectedKeyword]);

  const handleInputChange = (property, value) => {
    onUpdateBeat(beat.id, { [property]: value });
  };
  
  const handleTierlistChange = (e) => {
    const newTierlist = e.target.value;
    setTierlist(newTierlist);
    handleUpdate(beat.id, 'tierlist', newTierlist);
  };
  
  useEffect(() => {
    if (selectedGenre) {
      onUpdate(beat.id, 'genre', selectedGenre);
    }
  }, [selectedGenre]);
  
  useEffect(() => {
    if (selectedMood) {
      onUpdate(beat.id, 'mood', selectedMood);
    }
  }, [selectedMood]);

    const handleFocus = () => setInputFocused(true);

    const handleBlur = (id, field, value) => {
      setInputFocused(false);
      handleUpdate(id, field, value);
    };

  const handleGenreInputFocus = (e) => {
    handleFocus();
    handleGenreFocus(e);
  };

  const handleGenreInputBlur = (e) => {
    setInputFocused(false);
    handleGenreBlur(e);
  };

  const handleMoodInputFocus = (e) => {
    handleFocus();
    handleMoodFocus(e);
  };

  const handleMoodInputBlur = (e) => {
    setInputFocused(false);
    handleMoodBlur(e);
  };

  const handleKeywordInputFocus = (e) => {
    handleFocus();
    handleKeywordFocus(e);
  };

  const handleKeywordInputBlur = (e) => {
    setInputFocused(false);
    handleKeywordBlur(e);
  };

  const handleClick = () => {
    if (onBeatClick) {
      onBeatClick(beat);
    }
  };

  const handleRightClick = (e, beat) => {
    e.preventDefault();
    if (!selectedBeats.some(selectedBeat => selectedBeat.id === beat.id)) {
      handleBeatClick(beat, e);
    }
  };

  const handleMenuButtonClick = (e, beat) => {
    e.preventDefault();
    if (!selectedBeats.some(selectedBeat => selectedBeat.id === beat.id)) {
      handleBeatClick(beat, e);
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
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`${beatRowClasses} ${isInputFocused ? 'beat-row--focused' : ''}`}
      key={beatRowClasses}
      onClick={isMobileOrTablet() ? handleClick : (e) => handleBeatClick(beat, e)}
      onMouseEnter={!isMobileOrTablet() ? () => setHoveredBeat(beat.id) : undefined}
      onMouseLeave={!isMobileOrTablet() ? () => setHoveredBeat(null) : undefined}
      onContextMenu={(e) => {
        e.preventDefault();
        handleRightClick(e, beat);
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
              index={index} 
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
            onClick={mode !== 'edit' ? undefined : (e) => e.stopPropagation()}
            onMouseDown={mode !== 'edit' ? (e) => e.preventDefault() : undefined}
            spellCheck="false"
          />
        : 
          <div className='beat-row__input beat-row__input--static beat-row__input--title'>{beat.title}</div> 
        }
      </td>
      {mode !== 'lock' && (
      <>
      <td className="beat-row__data">
        {!isInputFocused && <Highlight text={beat.genre || ''} highlight={searchText || ''} />}
        <SelectableInput
            id={`beat-genre-select-${beat.id}`}
            value={selectedGenre}
            onChange={handleGenreChange}
            onFocus={handleGenreInputFocus}
            onBlur={handleGenreInputBlur}
            showItems={showGenres}
            filteredItems={filteredGenres}
            handleItemToggle={handleGenreToggle}
            className='beat-row__input' 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={mode !== 'edit' ? undefined : (e) => e.stopPropagation()}
            onMouseDown={mode !== 'edit' ? (e) => e.preventDefault() : undefined}
            spellCheck="false"
          />
      </td>
        <td className="beat-row__data">
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
            onClick={mode !== 'edit' ? undefined : (e) => e.stopPropagation()}
            onMouseDown={mode !== 'edit' ? (e) => e.preventDefault() : undefined}
            spellCheck="false"
          />
        </td>
        <td className="beat-row__data">
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
                onClick={mode !== 'edit' ? undefined : (e) => e.stopPropagation()}
                onMouseDown={mode !== 'edit' ? (e) => e.preventDefault() : undefined}
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
        </td>
        <td className="beat-row__data">
          {!isInputFocused && <Highlight text={beat.mood || ''} highlight={searchText || ''} />}
          <SelectableInput
            id={`beat-mood-select-${beat.id}`}
            value={selectedMood}
            onChange={handleMoodChange}
            onFocus={handleMoodInputFocus}
            onBlur={handleMoodInputBlur}
            showItems={showMoods}
            filteredItems={filteredMoods}
            handleItemToggle={handleMoodToggle}
            className='beat-row__input' 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={mode !== 'edit' ? undefined : (e) => e.stopPropagation()}
            onMouseDown={mode !== 'edit' ? (e) => e.preventDefault() : undefined}
            spellCheck="false"
          />
        </td>
        <td className="beat-row__data">
          {!isInputFocused && <Highlight text={beat.keywords || ''} highlight={searchText || ''} />}
          <SelectableInput
            id={`beat-keyword-select-${beat.id}`}
            value={selectedKeyword}
            onChange={handleKeywordChange}
            onFocus={handleKeywordInputFocus}
            onBlur={handleKeywordInputBlur}
            showItems={showKeywords}
            filteredItems={filteredKeywords}
            handleItemToggle={handleKeywordToggle}
            className='beat-row__input' 
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            onClick={mode !== 'edit' ? undefined : (e) => e.stopPropagation()}
            onMouseDown={mode !== 'edit' ? (e) => e.preventDefault() : undefined}
            spellCheck="false"
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
        onClick={(e) => {
          e.stopPropagation();
          handleMenuButtonClick(e, beat);
          if (isMobileOrTablet()) {
            setActiveContextMenu(beat.id);
          } else {
            if (activeContextMenu === beat.id) {
              setActiveContextMenu(null);
            } else {
              setActiveContextMenu(beat.id);
              const contextMenuWidth = -640;
              let calculatedX = window.innerWidth - e.clientX - contextMenuWidth;
              let calculatedY = e.clientY;
              if (calculatedX < 0) {
                calculatedX = 0;
              }
              setContextMenuX(calculatedX);
              setContextMenuY(calculatedY);
            }
          }
        }}
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