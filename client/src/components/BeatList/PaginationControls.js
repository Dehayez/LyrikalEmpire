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
      {startPage > 1 ? (
        <>
          <a
            onClick={() => handlePageClick(1)}
            className='pagination-controls__link'
            style={{ cursor: 'pointer' }}
          >
            1
          </a>
          <span className='pagination-controls__ellipsis' style={{cursor: 'default'}}>...</span>
        </>
      ) : (
        <span className='pagination-controls__placeholder'></span>
      )}
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
      {endPage < totalPages ? (
        <>
          <span className='pagination-controls__ellipsis' style={{cursor: 'default'}}>...</span>
          <a
            onClick={() => handlePageClick(totalPages)}
            className='pagination-controls__link'
            style={{ cursor: 'pointer' }}
          >
            {totalPages}
          </a>
        </>
      ) : (
        <span className='pagination-controls__placeholder'></span>
      )}
      <button className='icon-button' onClick={handleNextPage} disabled={currentPage === totalPages}>
        <IoChevronForwardSharp fontSize={20} />
      </button>
    </div>
  );
};

export default PaginationControls;