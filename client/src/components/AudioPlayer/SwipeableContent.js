import React from 'react';

const SwipeableContent = ({
  swipeableContainerRef,
  activeSlideIndex,
  slides,
  handleSwipeTouchStart,
  handleSwipeTouchMove,
  handleSwipeTouchEnd,
  handleSwipeMouseDown,
  goToSlide
}) => {
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
            transform: `translateX(-${activeSlideIndex * 50}%)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          {slides.map((slide, index) => (
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
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SwipeableContent; 