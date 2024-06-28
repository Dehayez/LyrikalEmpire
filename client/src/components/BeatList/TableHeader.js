import React, { useState, useRef } from 'react';
import './TableHeader.scss';
import { useResizableColumns } from '../../hooks';
import { IoChevronUpSharp, IoChevronDownSharp } from 'react-icons/io5';

const TableHeader = ({ onSort, sortConfig }) => {
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

  const columns = ['title', 'genre', 'bpm', 'tierlist', 'mood', 'keywords'];

  return (
    <thead className="table-header" ref={tableRef}>
      <tr>
        <th className={`table-header__cell table-header__cell--first ${isDragging ? 'no-transition' : ''}`}>#</th>
        {columns.map(column => (
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
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;