import React, { useState, useEffect } from 'react';
import { IoTrashBinSharp, IoAddSharp, IoListSharp, IoEllipsisHorizontal } from "react-icons/io5";
import { ContextMenu } from '../ContextMenu';
import './History.scss';

const History = ({ onBeatClick, currentBeat }) => {
  const history = JSON.parse(localStorage.getItem('playedBeatsHistory') || '[]');

  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);

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
  

  return (
    <div className="history">
       <ul className='history__list'>
          {history.map((beat, index) => (
            <>
              <li 
                key={index}
                className={`history__list-item ${currentBeat && beat.id === currentBeat.id ? 'history__list-item--playing' : ''}`}
                onClick={() => handleBeatClick(beat)}
                onContextMenu={(e) => handleRightClick(e, beat, index)}
              >
                {beat.title}
              </li>
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
                     onClick: () => console.log('Add to playlist clicked'),
                   },
                 ]}
               />
              )}
            </>
          ))}
        </ul>
    </div>
  );
};

export default History;