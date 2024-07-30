import React from 'react';
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import './PaginationControls.scss';

const PaginationControls = ({ currentPage, totalPages, handlePreviousPage, handleNextPage, handlePageClick }) => {
  const maxVisiblePages = 7;
  const halfVisiblePages = Math.floor(maxVisiblePages / 2);

  let startPage = Math.max(currentPage - halfVisiblePages, 1);
  let endPage = Math.min(currentPage + halfVisiblePages, totalPages);

  if (currentPage <= halfVisiblePages) {
    endPage = Math.min(maxVisiblePages, totalPages);
  } else if (currentPage + halfVisiblePages >= totalPages) {
    startPage = Math.max(totalPages - maxVisiblePages + 1, 1);
  }

  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="pagination-controls">
      <button className='icon-button' onClick={handlePreviousPage} disabled={currentPage === 1}>
        <IoChevronBackSharp fontSize={20} />
      </button>
      {pageNumbers.map((pageNumber, index) => (
        <a
          key={index}
          onClick={() => handlePageClick(pageNumber)}
          className={['pagination-controls__link', pageNumber === currentPage ? 'active' : ''].join(' ')}
          style={{ cursor: 'pointer' }}
        >
          {pageNumber}
        </a>
      ))}
      <button className='icon-button' onClick={handleNextPage} disabled={currentPage === totalPages}>
        <IoChevronForwardSharp fontSize={20} />
      </button>
    </div>
  );
};

export default PaginationControls;