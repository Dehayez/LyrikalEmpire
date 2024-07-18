import React, { useState, useEffect } from 'react';
import { IoAddSharp, IoListSharp, IoEllipsisHorizontal } from "react-icons/io5";
import { ContextMenu } from '../ContextMenu';
import { isMobileOrTablet } from '../../utils';
import './History.scss';

const History = ({ onBeatClick, currentBeat, addToCustomQueue }) => {
  const history = JSON.parse(localStorage.getItem('playedBeatsHistory') || '[]');

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

  const handleBeatClick = (beat) => {
    if (onBeatClick) {
      onBeatClick(beat);
    }
  };

  const handleRightClick = (e, beat, index) => {
    e.preventDefault();
    const historyListElement = document.querySelector('.history__list');
  
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

  const handleMenuButtonClick = (e, beat) => {
    e.preventDefault();
    handleBeatClick(beat, e);
    setActiveContextMenu({ top: e.clientY, left: e.clientX });
  };
  
  return (
    <div className="history">
       <ul className='history__list'>
          {history.map((beat, index) => (
              <li 
                key={index}
                className={`history__list-item ${currentBeat && beat.id === currentBeat.id ? 'history__list-item--playing' : ''}`}
                onContextMenu={(e) => handleRightClick(e, beat, index)}
                {...(isMobileOrTablet() ? {
                  onClick: handleBeatClick(beat),
                } : {
                  onMouseEnter: (e) => {
                    e.currentTarget.querySelectorAll('.interactive-button').forEach(button => {
                      button.style.opacity = 1;
                    });
                    setHoveredBeat(beat.id);
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.querySelectorAll('.interactive-button').forEach(button => {
                      button.style.opacity = 0;
                    });
                    setHoveredBeat(null);
                  },
                  onClick: (e) => handleBeatClick(beat, e),
                })}
              >
                {beat.title}
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
                        setContextMenuX(e.clientX);
                        setContextMenuY(e.clientY);
                      }
                    }
                  }}
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
  );
};

export default History;