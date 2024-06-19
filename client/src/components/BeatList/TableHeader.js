// TableHeader.js
import React, { useEffect, useRef } from 'react';

const TableHeader = () => {
  const tableRef = useRef(null);

  useEffect(() => {
    makeResizable();
  }, []);

  const makeResizable = () => {
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
  
    headers.slice(1, -1).forEach((header, originalIndex) => {
      header.classList.add('resizable-header');
    
      document.addEventListener('mousemove', e => {
        const rect = header.getBoundingClientRect();
        const isNearBorder = e.clientX >= rect.right - 8 && e.clientX <= rect.right;
        const isOverHeader = e.clientY >= rect.top && e.clientY <= rect.bottom;
      
        if (isNearBorder && isOverHeader) {
          header.classList.add('near-border');
          header.style.cursor = 'col-resize';
        } else {
          if (!header.classList.contains('dragging')) {
            header.classList.remove('near-border');
            header.style.cursor = '';
          }
        }
      });
      
      header.addEventListener('mousedown', e => {
        e.preventDefault();
        
        const rect = header.getBoundingClientRect();
        const isNearBorder = e.clientX >= rect.right - 8 && e.clientX <= rect.right;
        if (!isNearBorder) return;
    
        const initialMouseX = e.clientX;
        const initialWidth = header.offsetWidth;
    
        header.classList.add('dragging', 'near-border');
    
        document.body.style.cursor = 'col-resize';
        document.body.classList.add('dragging');
    
        const onMouseMove = e => {
          const newWidth = initialWidth + e.clientX - initialMouseX;
          header.style.width = `${newWidth}px`;
    
          localStorage.setItem(`headerWidth${originalIndex + 1}`, newWidth);
        };
    
        const onMouseUp = () => {
          header.classList.remove('dragging', 'near-border');
          document.body.classList.remove('dragging');
    
          document.body.style.cursor = '';
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };
    
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  };

  const styles = {
    thead: { position: 'sticky', top: 0, backgroundColor: '#181818', color: '#FFFFFF', textAlign: 'left', zIndex: 2},
    tdata: { padding: '8px', color: '#FFFFFF'},
    theadFirstChild: { textAlign: 'center', width: '50px'},
    th: { 
      boxSizing: 'border-box',
      padding: '10px', 
      paddingLeft: '18px', 
      color: '#FFFFFF',
      minWidth: '60px',
    },
  };

  return (
    <thead style={styles.thead} ref={tableRef}>
      <tr>
        <th className='beat-list__table-head' style={{...styles.th, ...styles.theadFirstChild}}>#</th>
        <th className='beat-list__table-head' style={styles.th}>Title</th>
        <th className='beat-list__table-head' style={styles.th}>Genre</th>
        <th className='beat-list__table-head' style={styles.th}>BPM</th>
        <th className='beat-list__table-head' style={styles.th}>Tierlist</th>
        <th className='beat-list__table-head' style={styles.th}>Mood</th>
        <th className='beat-list__table-head' style={styles.th}>Keywords</th>
      </tr>
    </thead>
  );
};

export default TableHeader;