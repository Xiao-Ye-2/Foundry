import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  goToPage,
  goToPreviousPage,
  goToNextPage
}) => {
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <div className="pagination">
      <button 
        className="pagination-button prev-button"
        onClick={goToPreviousPage}
        disabled={currentPage === 0}
      >
        <span className="pagination-icon">«</span> Previous
      </button>
      
      <div className="pagination-numbers">
        {/* First page */}
        {currentPage > 1 && (
          <button 
            className="pagination-number"
            onClick={() => goToPage(0)}
          >
            1
          </button>
        )}
        
        {/* Ellipsis after first page */}
        {currentPage > 2 && <span className="pagination-ellipsis">…</span>}
        
        {/* Generate page numbers around current page */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNumber;
          
          if (totalPages <= 5) {
            // If 5 or fewer pages, show all
            pageNumber = i;
          } else if (currentPage <= 2) {
            // Near start, show first 5 pages
            pageNumber = i;
          } else if (currentPage >= totalPages - 3) {
            // Near end, show last 5 pages
            pageNumber = totalPages - 5 + i;
          } else {
            // In middle, show 2 before and 2 after current
            pageNumber = currentPage - 2 + i;
          }
          
          // Skip rendering if number is out of range
          if (pageNumber < 0 || pageNumber >= totalPages) return null;
          
          // Skip first and last page if they'll be rendered separately
          if ((currentPage > 1 && pageNumber === 0) || 
              (currentPage < totalPages - 2 && pageNumber === totalPages - 1)) {
            return null;
          }
          
          return (
            <button 
              key={pageNumber}
              className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
              onClick={() => goToPage(pageNumber)}
            >
              {pageNumber + 1}
            </button>
          );
        })}
        
        {/* Ellipsis before last page */}
        {currentPage < totalPages - 3 && <span className="pagination-ellipsis">…</span>}
        
        {/* Last page */}
        {currentPage < totalPages - 2 && (
          <button 
            className="pagination-number"
            onClick={() => goToPage(totalPages - 1)}
          >
            {totalPages}
          </button>
        )}
      </div>
      
      <button 
        className="pagination-button next-button"
        onClick={goToNextPage}
        disabled={currentPage >= totalPages - 1}
      >
        Next <span className="pagination-icon">»</span>
      </button>
    </div>
  );
};

export default Pagination; 