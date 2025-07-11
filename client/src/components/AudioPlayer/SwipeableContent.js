import React, { useRef, useState, useEffect } from 'react';
import { useSwipeGestures, useLocalStorageSync } from '../../hooks';

const SwipeableContent = ({
  slides,
  onSlideChange
}) => {
  // Set up refs and state for swipe functionality
  const swipeableContainerRef = useRef(null);
  const swipeStartX = useRef(0);
  const swipeCurrentX = useRef(0);
  const isSwipeDragging = useRef(false);
  
  // Initialize state from localStorage or default to 0
  const [activeSlideIndex, setActiveSlideIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('activeSlideIndex');
      const parsed = saved ? JSON.parse(saved) : 0;
      return parsed >= 0 && parsed < slides.length ? parsed : 0;
    } catch (error) {
      return 0;
    }
  });

  // Use localStorage sync hook
  useLocalStorageSync({
    activeSlideIndex
  });

  // Handle cases where slides array changes and current index becomes invalid
  useEffect(() => {
    if (activeSlideIndex >= slides.length && slides.length > 0) {
      setActiveSlideIndex(0);
    }
  }, [slides.length, activeSlideIndex]);

  // Handle slide change with callback
  const handleSlideChange = (index) => {
    setActiveSlideIndex(index);
    if (onSlideChange) {
      onSlideChange(index);
    }
  };

  // Get swipe gesture handlers
  const {
    handleSwipeTouchStart,
    handleSwipeTouchMove,
    handleSwipeTouchEnd,
    handleSwipeMouseDown,
    goToSlide
  } = useSwipeGestures({
    swipeStartX,
    swipeCurrentX,
    isSwipeDragging,
    swipeableContainerRef,
    activeSlideIndex,
    setActiveSlideIndex: handleSlideChange,
    slidesLength: slides.length
  });

  const handleGoToSlide = (index) => {
    goToSlide(index);
    handleSlideChange(index);
  };

  return (
    <div className="audio-player__full-page-content">
      <div 
        className="swipeable-container"
        onTouchStart={handleSwipeTouchStart}
        onTouchMove={handleSwipeTouchMove}
        onTouchEnd={handleSwipeTouchEnd}
        onMouseDown={handleSwipeMouseDown}
      >
        <div 
          ref={swipeableContainerRef}
          className="swipeable-content"
          style={{
            transform: `translateX(-${activeSlideIndex * 100}%)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="swipeable-slide">
              {slide.content}
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation dots */}
      <div className="swipeable-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`swipeable-dot ${index === activeSlideIndex ? 'active' : ''}`}
            onClick={() => handleGoToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SwipeableContent; 