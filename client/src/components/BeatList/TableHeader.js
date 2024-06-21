import React, { useRef } from 'react';
import './TableHeader.scss';
import { useResizableColumns } from '../../hooks';

const TableHeader = () => {
  const tableRef = useRef(null);

  useResizableColumns(tableRef);

  return (
    <thead className="table-header" ref={tableRef}>
      <tr>
        <th className='table-header__cell table-header__cell--first'>#</th>
        <th className='table-header__cell'>Title</th>
        <th className='table-header__cell'>Genre</th>
        <th className='table-header__cell'>BPM</th>
        <th className='table-header__cell'>Tierlist</th>
        <th className='table-header__cell'>Mood</th>
        <th className='table-header__cell'>Keywords</th>
      </tr>
    </thead>
  );
};

export default TableHeader;