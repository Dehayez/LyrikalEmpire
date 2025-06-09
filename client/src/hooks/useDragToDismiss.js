import { useState, useRef } from 'react';

export const useDragToDismiss = (onDismissCallback) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const dismissRef = useRef(null);

  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches ? e.touches[0].clientY : e.clientY);
    if (dismissRef.current) {
      dismissRef.current.style.transition = 'none';
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startY;

    if (deltaY > 0) {
      setTranslateY(deltaY);
      if (dismissRef.current) {
        dismissRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }

    if (deltaY > 100) {
      onDismissCallback();
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    if (translateY < 100) {
      setTranslateY(0);
      if (dismissRef.current) {
        dismissRef.current.style.transition = 'transform 0.3s ease-out';
        dismissRef.current.style.transform = 'translateY(0)';
      }
    }
    setIsDragging(false);
    setStartY(0);
  };

  return {
    dismissRef,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};