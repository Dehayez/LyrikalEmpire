import React from 'react';
import './ContextMenu.scss';

const ContextMenu = ({ items, position }) => {
    return (
      <div className="row-context" style={{ top: position.top, left: position.left }}>
        {items.map((item, index) => (
          <div key={index} className={`row-context__button row-context__button--${item.buttonClass}`} onClick={item.onClick}>
            {item.icon && <item.icon className={`row-context__icon row-context__icon--${item.iconClass}`} />}
            <p className="row-context__text">{item.text}</p>
          </div>
        ))}
      </div>
    );
  };

export default ContextMenu;