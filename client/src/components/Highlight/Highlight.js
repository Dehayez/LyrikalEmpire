import React from 'react';
import './Highlight.scss';

export const Highlight = ({ text = '', highlight = '', children }) => {
    if (!highlight.trim()) {
      return children;
    }
  
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
  
    return (
      <div className='highlight'>
        <span className="highlight-content">
          {parts.filter(String).map((part, i) => 
            regex.test(part) ? <mark key={i} className="highlight-content-text">{part}</mark> : part
          )}
        </span>
        {children}
      </div>
    );
};