import { useEffect } from 'react';

export const useResizableColumns = (tableRef) => {
  useEffect(() => {
    if (!tableRef.current) {
      return;
    }

    const headers = Array.from(tableRef.current.querySelectorAll('th'));

    headers.forEach((header, index) => {
      const savedWidth = localStorage.getItem(`headerWidth${index}`);
      if (savedWidth) {
        header.style.width = `${savedWidth}px`;
      }
    });

    headers.forEach((header, index) => { 
      header.classList.add('resizable-header');

      if (header.classList.contains('non-draggable')) {
        return;
      }

      const handleMouseDown = e => {
        e.preventDefault();

        const rect = header.getBoundingClientRect();
        const isNearBorder = e.clientX >= rect.right - 8 && e.clientX <= rect.right;
        if (!isNearBorder) return;

        const initialMouseX = e.clientX;
        const initialWidth = header.offsetWidth;

        header.classList.add('dragging', 'near-border');

        document.body.style.cursor = 'col-resize';
        document.body.classList.add('dragging');

        const handleMouseMove = e => {
          const newWidth = initialWidth + e.clientX - initialMouseX;
          header.style.width = `${newWidth}px`;

          localStorage.setItem(`headerWidth${index}`, newWidth);
        };

        const handleMouseUp = () => {
          header.classList.remove('dragging', 'near-border');
          document.body.classList.remove('dragging');

          document.body.style.cursor = '';
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      };

      header.addEventListener('mousedown', handleMouseDown);
    });
  }, [tableRef]);
};

export default useResizableColumns;