import React, { useState, useEffect } from 'react';
import './ContextMenu.scss';

import { IoChevronForwardSharp } from "react-icons/io5";

import { getUserById } from '../../services';
import { useDragToDismiss } from '../../hooks';
import { isMobileOrTablet, slideIn, slideOut } from '../../utils';

const ContextMenu = ({ items, position, beat, setActiveContextMenu }) => {
  const {
    dismissRef,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useDragToDismiss(() => {
    hideContextMenu();
  });

  const [hoveredItem, setHoveredItem] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [artistName, setArtistName] = useState('Unknown Artist');

  const handleClick = (e, onClick) => {
    e.stopPropagation();
    onClick();
    hideContextMenu();
  };

  const showContextMenu = () => {
    slideIn(dismissRef.current);
    setIsVisible(true);
  };

  const hideContextMenu = () => {
    const overlay = document.querySelector('.context-menu__overlay');
    slideOut(dismissRef.current, overlay, () => {
      setIsVisible(false);
      setActiveContextMenu(null);
    });
  };

  useEffect(() => {
    if (beat) {
      showContextMenu();
    }
  }, [beat]);

  useEffect(() => {
    const element = dismissRef.current;
    if (element) {
      element.addEventListener('touchmove', handleDragMove, { passive: false });
    }
    return () => {
      if (element) {
        element.removeEventListener('touchmove', handleDragMove);
      }
    };
  }, [handleDragMove]);

  useEffect(() => {
    const fetchArtistName = async () => {
      if (beat?.user_id) {
        try {
          const user = await getUserById(beat.user_id);
          setArtistName(user?.username || 'Unknown Artist');
        } catch (error) {
          console.warn('Could not fetch artist name. Using fallback.', error);
        }
      }
    };

    fetchArtistName();
  }, [beat?.user_id]);

  if (isMobileOrTablet()) {
    return (
      <>
        <div 
          className={`context-menu__overlay${!isVisible ? ' inactive' : ''}`} 
          onClick={(e) => { e.stopPropagation(); hideContextMenu(); }}
        />
        <div 
          ref={dismissRef}
          className={`context-menu--mobile`}
          id="context-menu--mobile"
          onClick={(e) => { e.stopPropagation(); }}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          <div className="context-menu__header">
            <p className="context-menu__title">{beat ? beat.title : ''}</p>
            <p className="context-menu__artist">{artistName}</p>
          </div>
          {items.map((item, index) => (
            <div 
              key={index} 
              className={`context-menu__button context-menu__button--${item.buttonClass}`} 
              onClick={(e) => handleClick(e, item.onClick)}
            >
              {item.icon && <item.icon className={`context-menu__icon context-menu__icon--${item.iconClass}`} />}
              <p className="context-menu__text">{item.text}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div 
      className="context-menu" 
      id="context-menu" 
      style={{ top: position.top, left: position.left }} 
      onMouseDown={handleDragStart} 
      onMouseMove={handleDragMove} 
      onMouseUp={handleDragEnd} 
      onMouseLeave={hideContextMenu}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={`context-menu__button context-menu__button--${item.buttonClass}`}
          onClick={(e) => {
            if (typeof item.onClick === 'function') {
              handleClick(e, item.onClick);
            }
          }}
          onMouseEnter={() => setHoveredItem(index)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {item.icon && <item.icon className={`context-menu__icon context-menu__icon--${item.iconClass}`} />}
          <p className="context-menu__text">{item.text}</p>
          {item.subItems && (
            <button className="icon-button context-menu__subitem-icon">
              <IoChevronForwardSharp fontSize={16} />
            </button>
          )}
          {item.subItems && hoveredItem === index && (
            <div className={`context-menu__nested-list ${position.left + 300 > window.innerWidth ? 'context-menu__nested-list--left' : ''}`}>
              {item.subItems.map((subItem, subIndex) => (
                <div key={subIndex} className="context-menu__nested-list-item" onClick={() => {
                  if (typeof subItem.onClick === 'function') {
                    subItem.onClick();
                  }
                }}>
                  {subItem.text}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;