import React, { useState, useEffect } from 'react';
import { IoAddSharp, IoListSharp, IoEllipsisHorizontal } from "react-icons/io5";
import { ContextMenu } from '../ContextMenu';
import { isMobileOrTablet } from '../../utils';
import './Queue.scss';

const Queue = ({ queue, currentBeat, onBeatClick, isShuffleEnabled, customQueue, addToCustomQueue }) => {
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);
  const [hoveredBeat, setHoveredBeat] = useState(null);

  useEffect(() => {
    const toggleScroll = (disable) => document.body.classList.toggle('no-scroll', disable);
    const hideContextMenu = () => setActiveContextMenu(null);

    const manageContextMenuVisibility = (show) => {
      window[`${show ? 'add' : 'remove'}EventListener`]('click', hideContextMenu);
      toggleScroll(show);
    };

    manageContextMenuVisibility(!!activeContextMenu);

    return () => manageContextMenuVisibility(false);
  }, [activeContextMenu]);

  const handleRightClick = (e, beat, index) => {
    e.preventDefault();
    const historyListElement = document.querySelector('.queue');
  
    if (historyListElement) {
      const { left, top } = historyListElement.getBoundingClientRect();
      setActiveContextMenu(`${beat.id}-${index}`);
      setContextMenuX(e.clientX - left + 16);
      setContextMenuY(e.clientY - top + 84);
    }
  };

  const handleAddToCustomQueueClick = (beat) => {
    addToCustomQueue(beat);
  };

  const handleMenuButtonClick = (e, beat, index) => {
    e.stopPropagation();
    const button = e.currentTarget;
  
    const historyListElement = document.querySelector('.queue');
  
    if (historyListElement) {
      const { left, top } = historyListElement.getBoundingClientRect();
  
      const buttonRect = button.getBoundingClientRect();
      const adjustedX = buttonRect.left - left + buttonRect.width - 170;
      const adjustedY = buttonRect.top - top + 100; 
  
      setActiveContextMenu(`${beat.id}-${index}`);
      setContextMenuX(adjustedX);
      setContextMenuY(adjustedY);
    }
  };

  const handleBeatClick = (beat) => {
    if (onBeatClick) {
      onBeatClick(beat);
    }
  };

  const getNextItemForShuffle = () => {
    if (queue.length > 1) {
      return queue.slice(1).map((item, index) => ({
        ...item,
        uniqueKey: item.uniqueKey || `non-shuffle-${item.id}-${index}`
      }));
    }
    return [];
  };

  return (
    <div className="queue">
      {queue.length > 0 && (
        <div className='queue__section'> 
          <h3 className="queue__subtitle">Now Playing</h3>
          <ul className="queue__list">
            <li className={`queue__list-item queue__list-item--playing`} key={queue[0].id}>
              {queue[0].title}
            </li>
          </ul>
        </div>
      )}

      {customQueue.length > 0 && (
        <div className='queue__section'>
          <h3 className="queue__subtitle">Next in Queue</h3>
          <ul className='queue__list'>
          {customQueue.map((beat, index) => (
  <li
    className={`queue__list-item ${currentBeat && beat.id === currentBeat.id ? 'queue__list-item--playing' : ''}`}
    key={beat.id ? `custom-${beat.id}-${index}` : `custom-index-${index}`}
    onContextMenu={(e) => handleRightClick(e, beat, index)}
    onClick={(e) => {
      if (isMobileOrTablet()) {
        handleBeatClick(beat);
      }
    }}
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
  >
    {beat.title}
    <button 
      className={`icon-button icon-button--menu interactive-button ${isMobileOrTablet() ? 'icon-button--menu--mobile' : ''}`} 
      onClick={(e) => handleMenuButtonClick(e, beat, index)}
    >
      <IoEllipsisHorizontal fontSize={24} />
    </button>

    {activeContextMenu === `${beat.id}-${index}` && (
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
            onClick: () => console.log(`Add ${beat.id} to playlist clicked`),
          },
          {
            icon: IoListSharp,
            iconClass: 'add-queue',
            text: 'Add to queue',
            buttonClass: 'add-queue',
            onClick: () => handleAddToCustomQueueClick(beat),
          },
        ]}
      />
    )}
  </li>
))}
          </ul>
        </div>
      )}

      {queue.length > 1 && (
        <div className='queue__section'>
          <h3 className="queue__subtitle">Up Next</h3>
          <ul className="queue__list">
          {(isShuffleEnabled ? getNextItemForShuffle() : queue.slice(1).map((item, index) => ({
            ...item,
            uniqueKey: `non-shuffle-${item.id}-${index}`
          }))).map((beat, index) => (
            <li
              className={`queue__list-item ${currentBeat && beat.id === currentBeat.id ? 'queue__list-item--playing' : ''}`}
              key={beat.uniqueKey}
              onContextMenu={(e) => handleRightClick(e, beat, index)}
              onClick={(e) => {
                if (isMobileOrTablet()) {
                  handleBeatClick(beat);
                }
              }}
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
            >
            {beat.title}
            <button 
              className={`icon-button icon-button--menu interactive-button ${isMobileOrTablet() ? 'icon-button--menu--mobile' : ''}`} 
              onClick={(e) => handleMenuButtonClick(e, beat, index)}
            >
              <IoEllipsisHorizontal fontSize={24} />
            </button>

            {activeContextMenu === `${beat.id}-${index}` && (
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
                    onClick: () => console.log(`Add ${beat.id} to playlist clicked`),
                  },
                  {
                    icon: IoListSharp,
                    iconClass: 'add-queue',
                    text: 'Add to queue',
                    buttonClass: 'add-queue',
                    onClick: () => handleAddToCustomQueueClick(beat),
                  },
                ]}
              />
            )}
            </li>
          ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Queue;