import { useEffect } from 'react';
import { useHeaderWidths } from '../contexts';

export const useResizableColumns = (tableRef) => {
  const { setHeaderWidths } = useHeaderWidths();

  useEffect(() => {
    if (!tableRef.current) return;

    const headers = Array.from(tableRef.current.querySelectorAll('th'));
    const handlerMap = new Map();

    // Define default percentage widths for each column
    const defaultPercentages = {
      0: 3,   // # column (decreased from 5%)
      1: 36,  // title (increased from 34%)
      2: 3,   // tierlist
      3: 3,   // bpm
      4: 15,  // genre
      5: 15,  // mood
      6: 15,  // keyword
      7: 15,  // feature
      8: 3,   // duration (decreased from 5%)
      9: 3    // menu
    };

    // Function to recalculate percentages for visible columns
    const recalculatePercentages = () => {
      const visibleHeaders = headers.filter(header => {
        const style = window.getComputedStyle(header);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      const visibleIndices = visibleHeaders.map(header => headers.indexOf(header));
      
      // Calculate total current percentage of visible columns
      const totalCurrentPercentage = visibleIndices.reduce((sum, index) => {
        const savedPercentage = localStorage.getItem(`headerWidth${index}`);
        return sum + (savedPercentage ? parseFloat(savedPercentage) : defaultPercentages[index] || 10);
      }, 0);

      // If total is not 100%, redistribute
      if (Math.abs(totalCurrentPercentage - 100) > 1) {
        const redistributionFactor = 100 / totalCurrentPercentage;
        
        visibleIndices.forEach(index => {
          const savedPercentage = localStorage.getItem(`headerWidth${index}`);
          const currentPercentage = savedPercentage ? parseFloat(savedPercentage) : defaultPercentages[index] || 10;
          const newPercentage = currentPercentage * redistributionFactor;
          
          const header = headers[index];
          if (header) {
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
          }
        });
      }
    };

    // Migration: Clear old pixel-based values and set percentage defaults
    const migrateToPercentages = () => {
      const hasOldValues = localStorage.getItem('headerWidth1') && 
                          !isNaN(parseFloat(localStorage.getItem('headerWidth1'))) && 
                          parseFloat(localStorage.getItem('headerWidth1')) > 100; // Old pixel values were > 100
      
      if (hasOldValues) {
        // Clear all old header width values
        for (let i = 0; i < 10; i++) {
          localStorage.removeItem(`headerWidth${i}`);
        }
      }
    };

    // Run migration
    migrateToPercentages();

    // Initial recalculation
    recalculatePercentages();

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

      // Get saved percentage or use default
      const savedPercentage = localStorage.getItem(`headerWidth${index}`);
      const currentPercentage = savedPercentage ? parseFloat(savedPercentage) : defaultPercentages[index] || 10;
      
      header.style.width = `${currentPercentage}%`;

      // Also apply width to corresponding data cells
      const tableBody = tableRef.current.closest('table')?.querySelector('tbody');
      if (tableBody) {
        const dataCells = tableBody.querySelectorAll(`td:nth-child(${index + 1})`);
        dataCells.forEach(cell => {
          cell.style.width = `${currentPercentage}%`;
        });
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
        const tableWidth = tableRef.current.offsetWidth;

        header.classList.add('dragging');

        const handleMouseMove = (e) => {
          const deltaX = e.clientX - startX;
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
          
          // Recalculate percentages after resize
          recalculatePercentages();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      };

      hoverTarget.addEventListener('mousedown', handleMouseDown);
      handlerMap.set(header, handleMouseDown);
    });

    // Listen for window resize to recalculate when columns might show/hide
    const handleResize = () => {
      setTimeout(recalculatePercentages, 100); // Small delay to ensure DOM updates
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cleanupHeaders();
      window.removeEventListener('resize', handleResize);
    };
  }, [tableRef, setHeaderWidths]);

  // Export the recalculate function so it can be called from outside
  return { recalculatePercentages: () => {
    if (tableRef.current) {
      const headers = Array.from(tableRef.current.querySelectorAll('th'));
      const visibleHeaders = headers.filter(header => {
        const style = window.getComputedStyle(header);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      
      const visibleIndices = visibleHeaders.map(header => headers.indexOf(header));
      const totalCurrentPercentage = visibleIndices.reduce((sum, index) => {
        const savedPercentage = localStorage.getItem(`headerWidth${index}`);
        return sum + (savedPercentage ? parseFloat(savedPercentage) : 10);
      }, 0);
      
      if (Math.abs(totalCurrentPercentage - 100) > 1) {
        const redistributionFactor = 100 / totalCurrentPercentage;
        visibleIndices.forEach(index => {
          const savedPercentage = localStorage.getItem(`headerWidth${index}`);
          const currentPercentage = savedPercentage ? parseFloat(savedPercentage) : 10;
          const newPercentage = currentPercentage * redistributionFactor;
          
          const header = headers[index];
          if (header) {
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
          }
        });
      }
    }
  }};
};

export default useResizableColumns;
