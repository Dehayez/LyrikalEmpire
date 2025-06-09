import React, { useState, useEffect, useRef } from 'react';
import './ContextMenu.scss';
import { isMobileOrTablet } from '../../utils';
import { IoChevronForwardSharp } from "react-icons/io5";

const ContextMenu = ({ items, position, beat, setActiveContextMenu }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);
  const contextMenuRef = useRef(null);

  const handleClick = (e, onClick) => {
    e.stopPropagation();
    onClick();
    hideContextMenu();
  };

  const showContextMenu = () => {
    if (contextMenuRef.current) {
      contextMenuRef.current.style.transition = 'none';
      contextMenuRef.current.style.transform = 'translateY(100%)';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          contextMenuRef.current.style.transition = 'transform 0.3s ease-in-out';
          contextMenuRef.current.style.transform = 'translateY(0)';
        });
      });
    }
    setIsVisible(true);
  };

  const hideContextMenu = () => {
    if (contextMenuRef.current) {
      contextMenuRef.current.style.transition = 'transform 0.3s ease-in-out';
      contextMenuRef.current.style.transform = 'translateY(100%)';
    }

    const overlay = document.querySelector('.context-menu__overlay');
    if (overlay) {
      overlay.style.transition = 'opacity 0.3s ease';
      overlay.style.opacity = '0';

      setTimeout(() => {
        overlay.style.pointerEvents = 'none';
        setIsVisible(false);
        setActiveContextMenu(null);
        setTranslateY(0);
      }, 300);
    }
  };

  useEffect(() => {
    if (beat) {
      showContextMenu();
    }
  }, [beat]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches ? e.touches[0].clientY : e.clientY);
    if (contextMenuRef.current) {
      contextMenuRef.current.style.transition = 'none';
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startY;

    if (deltaY > 0) {
      setTranslateY(deltaY);
      if (contextMenuRef.current) {
        contextMenuRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }

    if (deltaY > 100) {
      hideContextMenu();
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    if (translateY < 100) {
      setTranslateY(0);
      if (contextMenuRef.current) {
        contextMenuRef.current.style.transition = 'transform 0.3s ease-out';
        contextMenuRef.current.style.transform = 'translateY(0)';
      }
    }
    setIsDragging(false);
    setStartY(0);
  };

  useEffect(() => {
    const contextMenuElement = contextMenuRef.current;
    if (contextMenuElement) {
      contextMenuElement.addEventListener('touchmove', handleDragMove, { passive: false });
    }
    return () => {
      if (contextMenuElement) {
        contextMenuElement.removeEventListener('touchmove', handleDragMove);
      }
    };
  }, [handleDragMove]);

  if (isMobileOrTablet()) {
    return (
      <>
        <div 
          className={`context-menu__overlay${!isVisible ? ' inactive' : ''}`} 
          onClick={(e) => { e.stopPropagation(); hideContextMenu(); }}
        />
        <div 
          ref={contextMenuRef}
          className={`context-menu--mobile`}
          id="context-menu--mobile"
          onClick={(e) => { e.stopPropagation(); }}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          <div className="context-menu__header">
            <p className="context-menu__title">{beat ? beat.title : ''}</p>
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