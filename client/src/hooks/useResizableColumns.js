import { useEffect, useCallback } from 'react';
import { useHeaderWidths } from '../contexts';

export const useResizableColumns = (tableRef) => {
  const { setHeaderWidths } = useHeaderWidths();

  const staticColumns = [0, 2, 3, 8, 9];
  const staticWidths = {
    0: 60,  // number
    2: 95,  // tierlist
    3: 80,  // bpm
    8: 60,  // duration
    9: 40   // menu
  };

  const resizableColumns = [1, 4, 5, 6, 7];
  const defaultPercentages = {
    1: 20,  // title
    4: 20,  // genre
    5: 20,  // mood
    6: 20,  // keyword
    7: 20   // feature
  };

  const recalculatePercentages = useCallback(() => {
    if (!tableRef.current) return;
    
    const table = tableRef.current.closest('table');
    if (!table) return;
    
    const headers = table.querySelectorAll('th');
    
    // Set static widths for fixed columns
    staticColumns.forEach(index => {
      const header = headers[index];
      if (header) {
        const width = staticWidths[index];
        header.style.width = `${width}px`;
        header.style.minWidth = `${width}px`;
        header.style.maxWidth = `${width}px`;
      }
    });

    // Calculate available width for percentage columns
    const tableWidth = table.offsetWidth;
    const totalStaticWidth = Object.values(staticWidths).reduce((sum, width) => sum + width, 0);
    const availableWidth = tableWidth - totalStaticWidth;

    // Get current widths of resizable columns
    const currentWidths = {};
    let totalResizablePercentage = 0;
    
    resizableColumns.forEach(index => {
      const header = headers[index];
      if (header) {
        // Get saved percentage or default
        const savedPercentage = localStorage.getItem(`headerWidth${index}`);
        const percentage = savedPercentage ? parseFloat(savedPercentage) : defaultPercentages[index];
        currentWidths[index] = percentage;
        totalResizablePercentage += percentage;
      }
    });
    
    // Normalize percentages to ensure they total 100%
    if (Math.abs(totalResizablePercentage - 100) > 1) {
      const scaleFactor = 100 / totalResizablePercentage;
      
      resizableColumns.forEach(index => {
        const header = headers[index];
        if (header) {
          const newPercentage = Math.max(10, Math.min(60, currentWidths[index] * scaleFactor));
          currentWidths[index] = newPercentage;
          localStorage.setItem(`headerWidth${index}`, newPercentage);
          setHeaderWidths((prev) => ({
            ...prev,
            [`headerWidth${index}`]: newPercentage,
          }));
        }
      });
    }

    // Apply percentage widths to resizable columns
    resizableColumns.forEach(index => {
      const header = headers[index];
      if (header) {
        const percentage = currentWidths[index];
        const pixelWidth = (availableWidth * percentage) / 100;
        header.style.width = `${pixelWidth}px`;
        header.style.minWidth = `${Math.max(80, pixelWidth * 0.5)}px`;
        header.style.maxWidth = `${pixelWidth * 2}px`;
      }
    });
  }, [setHeaderWidths]);

  useEffect(() => {
    if (!tableRef.current) return;

    const table = tableRef.current.closest('table');
    if (!table) return;

    const headers = table.querySelectorAll('th');

    // Migration: Clear old values for static columns
    const clearOldValues = () => {
      staticColumns.forEach(index => {
        const oldKey = `headerWidth${index}`;
        localStorage.removeItem(oldKey); // Remove any old values for static columns
      });

      // For resizable columns, clear old pixel-based values
      resizableColumns.forEach(index => {
        const oldKey = `headerWidth${index}`;
        const oldValue = localStorage.getItem(oldKey);
        
        if (oldValue && oldValue.includes('px')) {
          localStorage.removeItem(oldKey);
        }
        
        // Set default percentage if no value exists
        if (!localStorage.getItem(oldKey)) {
          localStorage.setItem(oldKey, defaultPercentages[index]);
        }
      });
    };

    clearOldValues();

    // Initial column setup
    recalculatePercentages();

    // Add resize functionality to resizable columns only
    resizableColumns.forEach(index => {
      const header = headers[index];
      if (!header) return;

      // Remove any existing resize handle
      const existingHandle = header.querySelector('.resize-handle');
      if (existingHandle) {
        existingHandle.remove();
      }

      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';

      header.style.position = 'relative';
      header.appendChild(resizeHandle);

      let isResizing = false;
      let startX = 0;
      let startPercentage = 0;

      const handleMouseDown = (e) => {
        isResizing = true;
        startX = e.clientX;
        // Get the current percentage from localStorage or default
        const savedPercentage = localStorage.getItem(`headerWidth${index}`);
        startPercentage = savedPercentage ? parseFloat(savedPercentage) : defaultPercentages[index];
        header.classList.add('dragging');
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
      };

      const handleMouseMove = (e) => {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const tableWidth = table.offsetWidth;
        const totalStaticWidth = Object.values(staticWidths).reduce((sum, width) => sum + width, 0);
        const availableWidth = tableWidth - totalStaticWidth;
        
        // Calculate percentage change based on available width
        const deltaPercentage = (deltaX / availableWidth) * 100;
        const newPercentage = Math.max(10, Math.min(60, startPercentage + deltaPercentage));
        
        // Update localStorage and context
        localStorage.setItem(`headerWidth${index}`, newPercentage);
        setHeaderWidths((prev) => ({
          ...prev,
          [`headerWidth${index}`]: newPercentage,
        }));

        // Apply the new width immediately
        const pixelWidth = (availableWidth * newPercentage) / 100;
        header.style.width = `${pixelWidth}px`;
      };

      const handleMouseUp = () => {
        isResizing = false;
        header.classList.remove('dragging');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Recalculate to ensure all columns fit properly
        recalculatePercentages();
      };

      resizeHandle.addEventListener('mousedown', handleMouseDown);
    });

    // Listen for window resize to recalculate column widths
    const handleResize = () => {
      recalculatePercentages();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, [tableRef, setHeaderWidths, recalculatePercentages]);

  // Export the recalculate function so it can be called from outside
  return { recalculatePercentages };
};

export default useResizableColumns;
