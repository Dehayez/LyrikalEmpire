import React, { useState, useEffect } from 'react';
import './ContextMenu.scss';
import { isMobileOrTablet } from '../../utils';
import { IoChevronForwardSharp } from "react-icons/io5";

const ContextMenu = ({ items, position, beat, setActiveContextMenu }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleClick = (e, onClick) => {
    e.stopPropagation();
    onClick();
    hideContextMenu();
  };

const hideContextMenu = () => {
  setIsVisible(false);
  setTimeout(() => {
    setActiveContextMenu(null);
  }, 300); // Match your CSS animation duration
};

  useEffect(() => {
    setIsVisible(true);
  }, [beat]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches ? e.touches[0].clientY : e.clientY);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setCurrentY(clientY);
    if (clientY - startY > 20) {
      hideContextMenu();
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setCurrentY(0);
    setStartY(0);
  };

  if (isMobileOrTablet()) {
    return (
      <>
        <div className={`context-menu__overlay${!isVisible ? ' inactive' : ''}`} onClick={(e) => { e.stopPropagation(); hideContextMenu(); }}></div>
        <div className={`context-menu--mobile ${beat && isVisible ? 'active' : 'inactive'}`} id='context-menu--mobile' onClick={(e) => { e.stopPropagation()}} onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}>
            <div className='context-menu__header'>
                <p className="context-menu__text"> {beat ? beat.title : ''}</p>
            </div>
            {items.map((item, index) => (
              <div key={index} className={`context-menu__button context-menu__button--${item.buttonClass}`} onClick={(e) => handleClick(e, item.onClick)}>
                {item.icon && <item.icon className={`context-menu__icon context-menu__icon--${item.iconClass}`} />}
                <p className="context-menu__text">{item.text}</p>
              </div>
            ))}
        </div>
      </>
    );
  }

  return (
    <div className="context-menu" id='context-menu' style={{ top: position.top, left: position.left }} onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={hideContextMenu}>
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
          {item.subItems && (<button className='icon-button context-menu__subitem-icon'><IoChevronForwardSharp fontSize={16} /></button>)}
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