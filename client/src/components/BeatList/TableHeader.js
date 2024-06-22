import React, { useState, useRef } from 'react';
import './TableHeader.scss';
import { useResizableColumns } from '../../hooks';

const TableHeader = () => {
  const tableRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useResizableColumns(tableRef, setIsDragging);

  return (
    <thead className="table-header" ref={tableRef}>
      <tr>
        <th className={`table-header__cell table-header__cell--first ${isDragging ? 'no-transition' : ''}`}>#</th>
        <th className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>Title</th>
        <th className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>Genre</th>
        <th className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>BPM</th>
        <th className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>Tierlist</th>
        <th className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>Mood</th>
        <th className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>Keywords</th>
      </tr>
    </thead>
  );
};

export default TableHeader;