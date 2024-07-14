import React, { useState, useEffect } from 'react';
import './ContextMenu.scss';
import { isMobileOrTablet } from '../../utils';

const ContextMenu = ({ items, position, beat, setActiveContextMenu }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const handleClick = (e, onClick) => {
    e.stopPropagation();
    onClick();
  };

  const hideContextMenu = () => {
    setIsVisible(false);
    setTimeout(() => {
      setActiveContextMenu(null);
    }, 300);
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
    if (clientY - startY > 50) { // Threshold for drag down to hide
      hideContextMenu();
      setIsDragging(false); // Stop dragging after hiding
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
        <div className={`context-menu-overlay`} onClick={(e) => { e.stopPropagation(); hideContextMenu(); }}></div>
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
    <div className="context-menu" id='context-menu' style={{ top: position.top, left: position.left }} onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd}>
      {items.map((item, index) => (
        <div key={index} className={`context-menu__button context-menu__button--${item.buttonClass}`} onClick={(e) => handleClick(e, item.onClick)}>
          {item.icon && <item.icon className={`context-menu__icon context-menu__icon--${item.iconClass}`} />}
          <p className="context-menu__text">{item.text}</p>
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;