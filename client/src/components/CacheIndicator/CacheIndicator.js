import React from 'react';
import './CacheIndicator.scss';

const CacheIndicator = ({ 
  isCached, 
  isLoading, 
  size = 'small', 
  showText = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`cache-indicator cache-indicator--loading cache-indicator--${size} ${className}`}>
        <div className="cache-indicator__icon">
          <div className="cache-indicator__spinner"></div>
        </div>
        {showText && <span className="cache-indicator__text">Loading...</span>}
      </div>
    );
  }

  if (isCached) {
    return (
      <div className={`cache-indicator cache-indicator--cached cache-indicator--${size} ${className}`}>
        <div className="cache-indicator__icon">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path 
              d="M6 1C3.24 1 1 3.24 1 6s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm-1 7L3 6l1.41-1.41L5 5.17l2.59-2.58L9 4l-4 4z" 
              fill="currentColor"
            />
          </svg>
        </div>
        {showText && <span className="cache-indicator__text">Cached</span>}
      </div>
    );
  }

  return (
    <div className={`cache-indicator cache-indicator--uncached cache-indicator--${size} ${className}`}>
      <div className="cache-indicator__icon">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path 
            d="M6 1C3.24 1 1 3.24 1 6s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm2.5 7.5L7 7l-1 1-1-1-1.5 1.5V6c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v2.5z" 
            fill="currentColor"
          />
        </svg>
      </div>
      {showText && <span className="cache-indicator__text">Download</span>}
    </div>
  );
};

export default CacheIndicator; 