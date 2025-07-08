import { useEffect, useCallback } from 'react';
import { 
  handleSwipeTouchStart, 
  handleSwipeTouchMove, 
  handleSwipeTouchEnd, 
  handleSwipeMouseDown,
  handleSwipeMouseMove,
  handleSwipeMouseUp,
  updateSwipeTransform
} from '../components/AudioPlayer/AudioPlayerSwipeHandlers';

/**
 * Custom hook to handle swipe gestures for the full page player
 * @param {Object} props - Properties for the hook
 * @returns {Object} Swipe gesture handlers
 */
export const useSwipeGestures = ({
  swipeStartX,
  swipeCurrentX,
  isSwipeDragging,
  swipeableContainerRef,
  activeSlideIndex,
  setActiveSlideIndex,
  slidesLength
}) => {
  // Swipe handlers
  const handleSwipeTouchStartWrapper = useCallback((e) => {
    handleSwipeTouchStart(e, swipeStartX, isSwipeDragging, swipeableContainerRef);
  }, [swipeStartX, isSwipeDragging, swipeableContainerRef]);

  const handleSwipeTouchMoveWrapper = useCallback((e) => {
    handleSwipeTouchMove(e, swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex);
  }, [swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex]);

  const handleSwipeTouchEndWrapper = useCallback(() => {
    handleSwipeTouchEnd(swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex, setActiveSlideIndex, slidesLength);
  }, [swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex, setActiveSlideIndex, slidesLength]);

  const handleSwipeMouseDownWrapper = useCallback((e) => {
    handleSwipeMouseDown(e, swipeStartX, isSwipeDragging, swipeableContainerRef);
  }, [swipeStartX, isSwipeDragging, swipeableContainerRef]);

  const handleSwipeMouseMoveWrapper = useCallback((e) => {
    handleSwipeMouseMove(e, swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex);
  }, [swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex]);

  const handleSwipeMouseUpWrapper = useCallback(() => {
    handleSwipeMouseUp(swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex, setActiveSlideIndex, slidesLength);
  }, [swipeStartX, swipeCurrentX, isSwipeDragging, swipeableContainerRef, activeSlideIndex, setActiveSlideIndex, slidesLength]);

  const goToSlide = useCallback((index) => {
    setActiveSlideIndex(index);
  }, [setActiveSlideIndex]);

  // Add mouse event listeners to document for desktop drag
  useEffect(() => {
    const handleDocumentMouseMove = (e) => handleSwipeMouseMoveWrapper(e);
    const handleDocumentMouseUp = () => handleSwipeMouseUpWrapper();

    if (isSwipeDragging.current) {
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [isSwipeDragging, handleSwipeMouseMoveWrapper, handleSwipeMouseUpWrapper]);

  // Update transform when active slide changes
  useEffect(() => {
    updateSwipeTransform(swipeableContainerRef, activeSlideIndex);
  }, [swipeableContainerRef, activeSlideIndex]);

  return {
    handleSwipeTouchStart: handleSwipeTouchStartWrapper,
    handleSwipeTouchMove: handleSwipeTouchMoveWrapper,
    handleSwipeTouchEnd: handleSwipeTouchEndWrapper,
    handleSwipeMouseDown: handleSwipeMouseDownWrapper,
    handleSwipeMouseMove: handleSwipeMouseMoveWrapper,
    handleSwipeMouseUp: handleSwipeMouseUpWrapper,
    goToSlide
  };
}; 