import React, { useState, useEffect } from 'react';
import { IoAddSharp, IoListSharp, IoEllipsisHorizontal } from "react-icons/io5";

import { usePlaylist } from '../../contexts';
import { addBeatsToPlaylist } from '../../services';

import { ContextMenu } from '../ContextMenu';
import { isMobileOrTablet } from '../../utils';
import './History.scss';

const History = ({ onBeatClick, currentBeat, addToCustomQueue }) => {
  const { playlists } = usePlaylist();

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
    const contextMenuWidth = 200;
    const contextMenuHeight = 150;
    let adjustedX = e.clientX;
    let adjustedY = e.clientY;
  
    if (adjustedX + contextMenuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - contextMenuWidth;
    }
    if (adjustedY + contextMenuHeight > window.innerHeight) {
      adjustedY = window.innerHeight - contextMenuHeight;
    }
  
    setActiveContextMenu(`${beat.id}-${index}`);
    setContextMenuX(adjustedX);
    setContextMenuY(adjustedY);
  };

  const handleAddToCustomQueueClick = (beat) => {
    addToCustomQueue(beat);
  };

  const handleMenuButtonClick = (e, beat, index) => {
    e.stopPropagation();
    const button = e.currentTarget;
  
    const buttonRect = button.getBoundingClientRect();
    const contextMenuWidth = 200;
    const adjustedX = buttonRect.right - contextMenuWidth;
    const adjustedY = buttonRect.top + buttonRect.height;
  
    setActiveContextMenu(`${beat.id}-${index}`);
    setContextMenuX(adjustedX);
    setContextMenuY(adjustedY);
  };

  const handleAddBeatToPlaylist = async (playlistId, beatIds) => {
    try {
      await addBeatsToPlaylist(playlistId, beatIds);
    } catch (error) {
      console.error('Error adding beats to playlist:', error);
    }
  };
  
  return (
    <div className="history">
       <ul className='history__list'>
          {history.map((beat, index) => (
              beat && beat.id ? (
              <li 
                key={index}
                className={`history__list-item`}
                onContextMenu={(e) => handleRightClick(e, beat, index)}
                onClick={(e) => {
                  handleBeatClick(beat);
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
                        subItems: playlists.map(playlist => ({
                          text: playlist.title,
                          onClick: () => {
                            handleAddBeatToPlaylist(playlist.id, beat.id);
                          },
                        })),
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
               ) : null
          ))}
        </ul>
    </div>
  );
};

export default History;