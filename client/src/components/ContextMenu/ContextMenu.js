import React from 'react';
import './ContextMenu.scss';

const ContextMenu = ({ items, position }) => {
    return (
      <div className="context-menu" id='context-menu' style={{ top: position.top, left: position.left }}>
        {items.map((item, index) => (
          <div key={index} className={`context-menu__button context-menu__button--${item.buttonClass}`} onClick={item.onClick}>
            {item.icon && <item.icon className={`context-menu__icon context-menu__icon--${item.iconClass}`} />}
            <p className="context-menu__text">{item.text}</p>
          </div>
        ))}
      </div>
    );
  };

export default ContextMenu;