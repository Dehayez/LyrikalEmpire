import React, { useState, useRef, useEffect } from 'react';
import { isMobileOrTablet } from '../../utils';
import { useResizableColumns } from '../../hooks';
import { IoChevronUpSharp, IoChevronDownSharp, IoTimeOutline } from 'react-icons/io5';
import './TableHeader.scss';

const TableHeader = ({ onSort, sortConfig, mode }) => {
  const tableRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  const [exceededThreshold, setExceededThreshold] = useState(false);

  useResizableColumns(tableRef, setIsDragging);

  const handleMouseEvents = (eventName, columnName) => {
    if (eventName === 'down') {
      setExceededThreshold(false);
      const timer = setTimeout(() => {
        setExceededThreshold(true);
        clearTimeout(pressTimer);
      }, 300);
      setPressTimer(timer);
    } else if (eventName === 'up') {
      clearTimeout(pressTimer);
      if (!exceededThreshold) {
        onSort && onSort(columnName);
      }
    }
  };

  const columns = ['title', 'genre', 'BPM', 'tierlist', 'mood', 'keywords'];

  return (
    <thead className="table-header" ref={tableRef}>
      <tr>
      {!(mode === 'lock' && isMobileOrTablet()) && (
        <th className={`table-header__cell table-header__cell--center ${isDragging ? 'no-transition' : ''} non-draggable`}>#</th>
      )}
        {columns.map(column => {
          if (mode === 'lock' && column !== 'title') {
            return null; 
          }
          return (
            <th key={column}
                onMouseDown={() => handleMouseEvents('down', column)}
                onMouseUp={() => handleMouseEvents('up', column)}
                className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>
              {column.charAt(0).toUpperCase() + column.slice(1)}
              {sortConfig.key === column && (
                <span className="table-header__sort-icon">
                  {sortConfig.direction === 'ascending' ? <IoChevronUpSharp /> : <IoChevronDownSharp />}
                </span>
              )}
            </th>
          );
        })}
         {!(isMobileOrTablet() && mode === 'lock') && (
         <th className={`table-header__cell table-header__cell--center ${isDragging ? 'no-transition' : ''} non-draggable`}><IoTimeOutline/></th>
         )}
      </tr>
    </thead>
  );
};

export default TableHeader;