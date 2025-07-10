import React, { useRef, useState } from 'react';
import { useSwipeGestures } from '../../hooks';

const SwipeableContent = ({
  slides,
  onSlideChange
}) => {
  // Set up refs and state for swipe functionality
  const swipeableContainerRef = useRef(null);
  const swipeStartX = useRef(0);
  const swipeCurrentX = useRef(0);
  const isSwipeDragging = useRef(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

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