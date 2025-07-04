import { useEffect, useCallback, useRef } from 'react';
import { useHeaderWidths } from '../contexts';

export const useResizableColumns = (tableRef) => {
  const { headerWidths, setHeaderWidths } = useHeaderWidths();
  const resizeTimeoutRef = useRef(null);

  // Default percentages for each column (total should equal 100%)
  const defaultPercentages = {
    0: 5,   // number
    1: 20,  // title
    2: 3,   // tierlist
    3: 3,   // bpm
    4: 15,  // feature
    5: 15,  // mood
    6: 15,  // genre
    7: 11,  // keywords
    8: 5,   // duration
    9: 3    // menu
  };

  // Function to recalculate percentages for visible columns
  const recalculatePercentages = useCallback(() => {
    if (!tableRef.current) return;
    
    const table = tableRef.current.closest('table');
    if (!table) return;
    
    const headers = table.querySelectorAll('th');
    const tableBody = table.querySelector('tbody');
    
    // Get current widths of resizable columns
    const resizableIndices = [1, 4, 5, 6, 7]; // title, feature, mood, genre, keywords
    const currentWidths = {};
    let totalResizableWidth = 0;
    
    resizableIndices.forEach(index => {
      const header = headers[index];
      if (header) {
        const width = parseFloat(header.style.width) || defaultPercentages[index];
        currentWidths[index] = width;
        totalResizableWidth += width;
      }
    });
    
    // If total is not 100%, redistribute proportionally
    if (Math.abs(totalResizableWidth - 76) > 1) { // 76% is the total for resizable columns (100% - 24% for fixed columns)
      const scaleFactor = 76 / totalResizableWidth;
      
      resizableIndices.forEach(index => {
        const header = headers[index];
        if (header) {
          const newWidth = Math.max(5, Math.min(50, currentWidths[index] * scaleFactor));
          header.style.width = `${newWidth}%`;
          
          // Apply to corresponding data cells
          if (tableBody) {
            const dataCells = tableBody.querySelectorAll(`td:nth-child(${index + 1})`);
            dataCells.forEach(cell => {
              cell.style.width = `${newWidth}%`;
            });
          }
          
          localStorage.setItem(`headerWidth${index}`, newWidth);
          setHeaderWidths((prev) => ({
            ...prev,
            [`headerWidth${index}`]: newWidth,
          }));
        }
      });
    }
    
    // Ensure non-resizable columns stay at their fixed widths
    const nonResizableIndices = [0, 2, 3, 8, 9]; // number, tierlist, bpm, duration, menu
    nonResizableIndices.forEach(nonResizableIndex => {
      const nonResizableHeader = headers[nonResizableIndex];
      if (nonResizableHeader) {
        const fixedWidth = defaultPercentages[nonResizableIndex];
        nonResizableHeader.style.width = `${fixedWidth}%`;
        
        // Apply to corresponding data cells
        if (tableBody) {
          const nonResizableDataCells = tableBody.querySelectorAll(`td:nth-child(${nonResizableIndex + 1})`);
          nonResizableDataCells.forEach(cell => {
            cell.style.width = `${fixedWidth}%`;
          });
        }
      }
    });
  }, [defaultPercentages, setHeaderWidths]);

  // Debounced version of recalculatePercentages
  const debouncedRecalculate = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
      recalculatePercentages();
    }, 100);
  }, [recalculatePercentages]);

  useEffect(() => {
    if (!tableRef.current) return;

    const table = tableRef.current.closest('table');
    if (!table) return;

    const headers = table.querySelectorAll('th');

    // Migration: Clear old pixel-based values and set percentage defaults
    const clearOldValues = () => {
      for (let i = 0; i < headers.length; i++) {
        const oldKey = `headerWidth${i}`;
        const oldValue = localStorage.getItem(oldKey);
        
        if (oldValue && oldValue.includes('px')) {
          localStorage.removeItem(oldKey);
        }
        
        // Set default percentage if no value exists
        if (!localStorage.getItem(oldKey)) {
          localStorage.setItem(oldKey, defaultPercentages[i]);
        }
      }
    };

    clearOldValues();

    // Apply saved or default widths
    headers.forEach((header, index) => {
      const savedWidth = localStorage.getItem(`headerWidth${index}`);
      const width = savedWidth ? parseFloat(savedWidth) : defaultPercentages[index];
      header.style.width = `${width}%`;
    });

    // Apply widths to data cells
    const tableBody = table.querySelector('tbody');
    if (tableBody) {
      headers.forEach((header, index) => {
        const savedWidth = localStorage.getItem(`headerWidth${index}`);
        const width = savedWidth ? parseFloat(savedWidth) : defaultPercentages[index];
        const dataCells = tableBody.querySelectorAll(`td:nth-child(${index + 1})`);
        dataCells.forEach(cell => {
          cell.style.width = `${width}%`;
        });
      });
    }

    // Add resize functionality to resizable columns
    const resizableIndices = [1, 4, 5, 6, 7]; // title, feature, mood, genre, keywords

    resizableIndices.forEach(index => {
      const header = headers[index];
      if (!header) return;

      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      resizeHandle.style.cssText = `
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        cursor: col-resize;
        background: transparent;
        z-index: 10;
      `;

      header.style.position = 'relative';
      header.appendChild(resizeHandle);

      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      const handleMouseDown = (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = header.offsetWidth;
        header.classList.add('dragging');
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
      };

      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const tableWidth = table.offsetWidth;
        const deltaPercentage = (deltaX / tableWidth) * 100;
        const newPercentage = Math.max(5, Math.min(50, (startWidth / tableWidth) * 100 + deltaPercentage));
        
        header.style.width = `${newPercentage}%`;
        
        // Also apply width to corresponding data cells
        const tableBody = tableRef.current.closest('table')?.querySelector('tbody');
        if (tableBody) {
          const dataCells = tableBody.querySelectorAll(`td:nth-child(${index + 1})`);
          dataCells.forEach(cell => {
            cell.style.width = `${newPercentage}%`;
          });
        }
        
        localStorage.setItem(`headerWidth${index}`, newPercentage);
        setHeaderWidths((prev) => ({
          ...prev,
          [`headerWidth${index}`]: newPercentage,
        }));
      };

      const handleMouseUp = () => {
        header.classList.remove('dragging');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Use debounced recalculation to prevent glitches
        debouncedRecalculate();
      };

      resizeHandle.addEventListener('mousedown', handleMouseDown);
    });

    // Cleanup function
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [tableRef, defaultPercentages, setHeaderWidths, debouncedRecalculate]);

  // Export the recalculate function so it can be called from outside
  return { recalculatePercentages };
};

export default useResizableColumns;
