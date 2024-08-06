import { useEffect } from 'react';
import { useHeaderWidths } from '../contexts';

export const useResizableColumns = (tableRef, mode) => {
  const { setHeaderWidths } = useHeaderWidths();

  useEffect(() => {
    if (!tableRef.current) return;

    const headers = Array.from(tableRef.current.querySelectorAll('th'));

    const cleanupHeaders = () => {
      headers.forEach(header => {
        header.removeEventListener('mousedown', header.handleMouseDown);
        header.classList.remove('resizable-header');
        header.style.width = '';
      });
    };

    if (mode === 'lock') {
      cleanupHeaders();
      return;
    }

    headers.forEach((header, index) => {
      header.classList.add('resizable-header');

      const savedWidth = localStorage.getItem(`headerWidth${index}`);
      if (savedWidth) {
        header.style.width = `${savedWidth}px`;
      }

      if (header.classList.contains('non-draggable')) return;

      const handleMouseDown = e => {
        e.preventDefault();

        const rect = header.getBoundingClientRect();
        const isNearBorder = e.clientX >= rect.right - 8 && e.clientX <= rect.right;
        if (!isNearBorder) return;

        const initialMouseX = e.clientX;
        const initialWidth = header.offsetWidth;

        document.body.style.cursor = 'col-resize';
        document.body.classList.add('dragging');

        const handleMouseMove = e => {
          const newWidth = initialWidth + e.clientX - initialMouseX;
          header.style.width = `${newWidth}px`;
          localStorage.setItem(`headerWidth${index}`, newWidth);
          setHeaderWidths((prevWidths) => ({
            ...prevWidths,
            [`headerWidth${index}`]: newWidth,
          }));
        };

        const handleMouseUp = () => {
          document.body.style.cursor = '';
          document.body.classList.remove('dragging');
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      };

      header.handleMouseDown = handleMouseDown;

      header.addEventListener('mousedown', handleMouseDown);
    });

    return () => {
      cleanupHeaders();
    };
  }, [tableRef, mode]);
};

export default useResizableColumns;