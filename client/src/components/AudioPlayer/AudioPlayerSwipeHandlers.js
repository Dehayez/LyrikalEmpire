/**
 * Handlers for swipe gestures in the audio player
 */

/**
 * Handle touch start event for swipeable content
 * @param {Object} e - Touch event
 * @param {Object} swipeStartX - Ref to store start X position
 * @param {Object} isSwipeDragging - Ref to track dragging state
 * @param {Object} swipeableContainerRef - Ref to swipeable container
 */
export const handleSwipeTouchStart = (e, swipeStartX, isSwipeDragging, swipeableContainerRef) => {
  swipeStartX.current = e.touches[0].clientX;
  isSwipeDragging.current = true;
  
  if (swipeableContainerRef.current) {
    swipeableContainerRef.current.style.transition = 'none';
  }
};

/**
 * Handle touch move event for swipeable content
 * @param {Object} e - Touch event
 * @param {Object} swipeStartX - Ref with start X position
 * @param {Object} swipeCurrentX - Ref to store current X position
 * @param {Object} isSwipeDragging - Ref with dragging state
 * @param {Object} swipeableContainerRef - Ref to swipeable container
 * @param {number} activeSlideIndex - Current active slide index
 */
export const handleSwipeTouchMove = (e, swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex) => {
  if (!isSwipeDragging.current) return;
  
  swipeCurrentX.current = e.touches[0].clientX;
  const diffX = swipeCurrentX.current - swipeStartX.current;
  
  if (swipeableContainerRef.current) {
    const translateX = -activeSlideIndex * 100 + (diffX / swipeableContainerRef.current.offsetWidth) * 100;
    swipeableContainerRef.current.style.transform = `translateX(${translateX}%)`;
  }
};

/**
 * Handle touch end event for swipeable content
 * @param {Object} swipeStartX - Ref with start X position
 * @param {Object} swipeCurrentX - Ref with current X position
 * @param {Object} isSwipeDragging - Ref with dragging state
 * @param {Object} swipeableContainerRef - Ref to swipeable container
 * @param {number} activeSlideIndex - Current active slide index
 * @param {Function} setActiveSlideIndex - State setter for active slide index
 * @param {number} slidesLength - Number of slides
 */
export const handleSwipeTouchEnd = (
  swipeStartX, 
  swipeCurrentX, 
  isSwipeDragging, 
  swipeableContainerRef, 
  activeSlideIndex, 
  setActiveSlideIndex,
  slidesLength
) => {
  if (!isSwipeDragging.current) return;
  
  const diffX = swipeCurrentX.current - swipeStartX.current;
  const threshold = 50; // Minimum distance to trigger slide
  
  if (swipeableContainerRef.current) {
    swipeableContainerRef.current.style.transition = 'transform 0.3s ease-out';
  }
  
  if (Math.abs(diffX) > threshold) {
    if (diffX > 0 && activeSlideIndex > 0) {
      // Swipe right - go to previous slide
      setActiveSlideIndex(activeSlideIndex - 1);
    } else if (diffX < 0 && activeSlideIndex < slidesLength - 1) {
      // Swipe left - go to next slide
      setActiveSlideIndex(activeSlideIndex + 1);
    }
  }
  
  isSwipeDragging.current = false;
  updateSwipeTransform(swipeableContainerRef, activeSlideIndex);
};

/**
 * Handle mouse down event for swipeable content (desktop)
 * @param {Object} e - Mouse event
 * @param {Object} swipeStartX - Ref to store start X position
 * @param {Object} isSwipeDragging - Ref to track dragging state
 * @param {Object} swipeableContainerRef - Ref to swipeable container
 */
export const handleSwipeMouseDown = (e, swipeStartX, isSwipeDragging, swipeableContainerRef) => {
  swipeStartX.current = e.clientX;
  isSwipeDragging.current = true;
  
  if (swipeableContainerRef.current) {
    swipeableContainerRef.current.style.transition = 'none';
  }
  
  // Prevent text selection during drag
  e.preventDefault();
};

/**
 * Handle mouse move event for swipeable content
 * @param {Object} e - Mouse event
 * @param {Object} swipeStartX - Ref with start X position
 * @param {Object} swipeCurrentX - Ref to store current X position
 * @param {Object} isSwipeDragging - Ref with dragging state
 * @param {Object} swipeableContainerRef - Ref to swipeable container
 * @param {number} activeSlideIndex - Current active slide index
 */
export const handleSwipeMouseMove = (e, swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex) => {
  if (!isSwipeDragging.current) return;
  
  swipeCurrentX.current = e.clientX;
  const diffX = swipeCurrentX.current - swipeStartX.current;
  
  if (swipeableContainerRef.current) {
    const translateX = -activeSlideIndex * 100 + (diffX / swipeableContainerRef.current.offsetWidth) * 100;
    swipeableContainerRef.current.style.transform = `translateX(${translateX}%)`;
  }
};

/**
 * Handle mouse up event for swipeable content
 * @param {Object} swipeStartX - Ref with start X position
 * @param {Object} swipeCurrentX - Ref with current X position
 * @param {Object} isSwipeDragging - Ref with dragging state
 * @param {Object} swipeableContainerRef - Ref to swipeable container
 * @param {number} activeSlideIndex - Current active slide index
 * @param {Function} setActiveSlideIndex - State setter for active slide index
 * @param {number} slidesLength - Number of slides
 */
export const handleSwipeMouseUp = (
  swipeStartX, 
  swipeCurrentX, 
  isSwipeDragging, 
  swipeableContainerRef, 
  activeSlideIndex, 
  setActiveSlideIndex,
  slidesLength
) => {
  if (!isSwipeDragging.current) return;
  
  const diffX = swipeCurrentX.current - swipeStartX.current;
  const threshold = 50;
  
  if (swipeableContainerRef.current) {
    swipeableContainerRef.current.style.transition = 'transform 0.3s ease-out';
  }
  
  if (Math.abs(diffX) > threshold) {
    if (diffX > 0 && activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    } else if (diffX < 0 && activeSlideIndex < slidesLength - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
    }
  }
  
  isSwipeDragging.current = false;
  updateSwipeTransform(swipeableContainerRef, activeSlideIndex);
};

/**
 * Update transform property of swipeable container
 * @param {Object} swipeableContainerRef - Ref to swipeable container
 * @param {number} activeSlideIndex - Current active slide index
 */
export const updateSwipeTransform = (swipeableContainerRef, activeSlideIndex) => {
  if (swipeableContainerRef.current) {
    swipeableContainerRef.current.style.transform = `translateX(-${activeSlideIndex * 100}%)`;
  }
}; 