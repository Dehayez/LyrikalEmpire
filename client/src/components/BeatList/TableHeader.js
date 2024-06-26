import React, { useState, useRef } from 'react';
import './TableHeader.scss';
import { useResizableColumns } from '../../hooks';

const TableHeader = ({ onSort }) => {
  const tableRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useResizableColumns(tableRef, setIsDragging);

  const handleSort = (columnName) => {
    if (onSort) {
      onSort(columnName);
    }
  };

  return (
    <thead className="table-header" ref={tableRef}>
      <tr>
        <th onClick={() => handleSort('number')} className={`table-header__cell table-header__cell--first ${isDragging ? 'no-transition' : ''}`}>#</th>
        <th onClick={() => handleSort('title')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>Title</th>
        <th onClick={() => handleSort('genre')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>Genre</th>
        <th onClick={() => handleSort('bpm')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>BPM</th>
        <th onClick={() => handleSort('tierlist')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>Tierlist</th>
        <th onClick={() => handleSort('mood')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>Mood</th>
        <th onClick={() => handleSort('keywords')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>Keywords</th>
      </tr>
    </thead>
  );
};

export default TableHeader;