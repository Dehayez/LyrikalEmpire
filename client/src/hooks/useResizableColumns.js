import { useEffect } from 'react';
import { useHeaderWidths } from '../contexts';

export const useResizableColumns = (tableRef) => {
  const { setHeaderWidths } = useHeaderWidths();

  useEffect(() => {
    if (!tableRef.current) return;

    const headers = Array.from(tableRef.current.querySelectorAll('th'));
    const handlerMap = new Map();

    const cleanupHeaders = () => {
      handlerMap.forEach((handler, header) => {
        const hoverTarget = header.querySelector('.hover-target');
        if (hoverTarget) {
          hoverTarget.removeEventListener('mousedown', handler);
          hoverTarget.remove();
        }

        const resizeHandle = header.querySelector('.resize-handle');
        if (resizeHandle) resizeHandle.remove();

        header.classList.remove('resizable-header', 'dragging');
        header.style.width = '';
      });
    };

    headers.forEach((header, index) => {
      const columnText = header.querySelector('.table-header__cell-text')?.textContent?.toLowerCase();
      if (!columnText || ['bpm', 'tierlist'].includes(columnText) || header.classList.contains('non-draggable')) {
        return;
      }

      header.classList.add('resizable-header');

      const savedWidth = localStorage.getItem(`headerWidth${index}`);
      if (savedWidth) {
        header.style.width = `${savedWidth}px`;
      }

      // Visual element
      const resizeHandle = document.createElement('div');
      resizeHandle.classList.add('resize-handle');
      header.appendChild(resizeHandle);

      // Hover + drag zone
      const hoverTarget = document.createElement('div');
      hoverTarget.classList.add('hover-target');
      header.appendChild(hoverTarget);

      const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = header.offsetWidth;

        header.classList.add('dragging');

        const handleMouseMove = (e) => {
          const newWidth = Math.max(startWidth + e.clientX - startX, 50);
          header.style.width = `${newWidth}px`;
          localStorage.setItem(`headerWidth${index}`, newWidth);
          setHeaderWidths((prev) => ({
            ...prev,
            [`headerWidth${index}`]: newWidth,
          }));
        };

        const handleMouseUp = () => {
          header.classList.remove('dragging');
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      };

      hoverTarget.addEventListener('mousedown', handleMouseDown);
      handlerMap.set(header, handleMouseDown);
    });

    return () => cleanupHeaders();
  }, [tableRef, setHeaderWidths]);
};

export default useResizableColumns;
