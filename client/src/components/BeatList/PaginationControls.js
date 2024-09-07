import React, { useState, useEffect } from 'react';
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import { useBeat } from '../../contexts/BeatContext';
import './PaginationControls.scss';

const PaginationControls = ({ items, currentBeat, currentPage, setCurrentPage }) => {
  const { setPaginatedBeats } = useBeat();
  const itemsPerPageNumber = 1;
  const [maxVisiblePages, setMaxVisiblePages] = useState(itemsPerPageNumber);
  const itemsPerPage = itemsPerPageNumber;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const halfVisiblePages = Math.floor(maxVisiblePages / 2);
  
  let startPage = Math.max(currentPage - halfVisiblePages, 1);
  let endPage = Math.min(currentPage + halfVisiblePages, totalPages);
  
  if (currentPage <= halfVisiblePages) {
    endPage = Math.min(maxVisiblePages, totalPages);
  } else if (currentPage + halfVisiblePages >= totalPages) {
    startPage = Math.max(totalPages - maxVisiblePages + 1, 1);
  }
  
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  const currentBeatPage = currentBeat ? Math.ceil((items.findIndex(item => item.id === currentBeat.id) + 1) / itemsPerPage) : null;

  useEffect(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(1);
    } else {
      const currentBeats = items.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
      setPaginatedBeats(currentBeats);
    }
  }, [currentPage, items]);

  const handleNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleGoToCurrentBeatPage = () => {
    if (currentBeatPage) {
      setCurrentPage(currentBeatPage);
    }
  };

  useEffect(() => {
    const mediaQueries = [
      { query: '(max-width: 600px)', pages: 3 },
      { query: '(min-width: 601px) and (max-width: 900px)', pages: 5 },
      { query: '(min-width: 901px) and (max-width: 1200px)', pages: 7 },
      { query: '(min-width: 1201px) and (max-width: 1500px)', pages: 11 },
      { query: '(min-width: 1501px) and (max-width: 1800px)', pages: 13 },
      { query: '(min-width: 1801px)', pages: 18 },
    ];

    const handleMediaQueryChange = () => {
      for (const { query, pages } of mediaQueries) {
        if (window.matchMedia(query).matches) {
          setMaxVisiblePages(pages);
          break;
        }
      }
    };

    handleMediaQueryChange();

    mediaQueries.forEach(({ query }) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', handleMediaQueryChange);
    });

    return () => {
      mediaQueries.forEach(({ query }) => {
        const mediaQueryList = window.matchMedia(query);
        mediaQueryList.removeEventListener('change', handleMediaQueryChange);
      });
    };
  }, []);

  return (
    <div className="pagination-controls">
      <div className="pagination-controls-top">
        <button className={`icon-button ${currentPage === 1 ? 'icon-button--disabled' : ''}`} onClick={handlePreviousPage} disabled={currentPage === 1}>
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
            className={[
              'pagination-controls__link',
              pageNumber === currentPage ? 'active' : '',
              pageNumber === currentBeatPage ? 'highlight' : ''
            ].join(' ')}
            style={{ cursor: 'pointer' }}
          >
            {pageNumber}
            {pageNumber === currentBeatPage && <div className="indicator"></div>}
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
        <button className={`icon-button ${currentPage === totalPages ? 'icon-button--disabled' : ''}`} onClick={handleNextPage} disabled={currentPage === totalPages}>
          <IoChevronForwardSharp fontSize={20} />
        </button>
      </div>
      {currentBeatPage !== 0 && (
        <div className="pagination-controls-bottom">
          <a 
          className={`pagination-controls-bottom__link ${currentPage === currentBeatPage ? 'pagination-controls-bottom__link--ghost' : ''}`} 
          onClick={handleGoToCurrentBeatPage}
          >
            Go to Current Track
          </a>
        </div>
      )}
    </div>
  );
};

export default PaginationControls;