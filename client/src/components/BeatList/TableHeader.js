import React, { useState, useRef } from 'react';
import './TableHeader.scss';
import { useResizableColumns } from '../../hooks';
import { IoChevronUpSharp, IoChevronDownSharp } from 'react-icons/io5';

const TableHeader = ({ onSort, sortConfig }) => {
  const tableRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useResizableColumns(tableRef, setIsDragging);

  const handleSort = (columnName) => {
    if (onSort) {
      onSort(columnName);
    }
  };

  const renderSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'ascending' ? <IoChevronUpSharp /> : <IoChevronDownSharp />;
    }
    return null;
  };

  return (
    <thead className="table-header" ref={tableRef}>
      <tr>
        <th className={`table-header__cell table-header__cell--first ${isDragging ? 'no-transition' : ''}`}>#</th>
        <th onClick={() => handleSort('title')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>
          Title{renderSortIcon('title')}
        </th>
        <th onClick={() => handleSort('genre')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>
          Genre{renderSortIcon('genre')}
        </th>
        <th onClick={() => handleSort('bpm')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>
          BPM{renderSortIcon('bpm')}
        </th>
        <th onClick={() => handleSort('tierlist')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>
          Tierlist{renderSortIcon('tierlist')}
        </th>
        <th onClick={() => handleSort('mood')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>
          Mood{renderSortIcon('mood')}
        </th>
        <th onClick={() => handleSort('keywords')} className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>
          Keywords{renderSortIcon('keywords')}
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;