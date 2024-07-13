import React, { useState, useEffect } from 'react';
import './ContextMenu.scss';
import { isMobileOrTablet } from '../../utils';

const ContextMenu = ({ items, position, beat }) => {
  const [isVisible, setIsVisible] = useState(true);

  const hideMenu = () => setIsVisible(false);

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (e.touches[0].clientY > 100) {
        hideMenu();
      }
    };

    if (isMobileOrTablet()) {
      window.addEventListener('touchmove', handleTouchMove);
    }

    return () => {
      if (isMobileOrTablet()) {
        window.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  const handleClick = (e, onClick) => {
    e.stopPropagation();
    onClick();
  };

  if (isMobileOrTablet()) {
    // Mobile or Tablet Context Menu
    return (
      <>
        <div className={`context-menu-overlay ${isVisible ? 'show' : ''}`} onClick={(e) => { e.stopPropagation(); hideMenu(); }}></div>
        <div className={`context-menu--mobile ${isVisible ? 'show' : ''}`} id='context-menu--mobile' onClick={(e) => { e.stopPropagation()}}>
            <div className='context-menu__header'>
                <p className="context-menu__text"> {beat.title}</p>
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

  // Default Context Menu
  return (
    <div className="context-menu" id='context-menu' style={{ top: position.top, left: position.left }}>
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