import React from 'react';
import { Pagination as BootstrapPagination, Form } from 'react-bootstrap';
import { PaginationInfo } from '../types/product';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  className?: string;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  pageSizeOptions = [12, 24, 48],
  className = ''
}) => {
  const { page, pageSize, total, totalPages } = pagination;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== page) {
      onPageChange(pageNumber);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    if (onPageSizeChange && size !== pageSize) {
      onPageSizeChange(size);
    }
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    items.push(
      <BootstrapPagination.Item 
        key={1} 
        active={page === 1}
        onClick={() => handlePageChange(1)}
      >
        1
      </BootstrapPagination.Item>
    );

    if (totalPages > 1) {
      // Calculate range around current page
      let startPage = Math.max(2, page - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
      
      if (endPage - startPage < maxVisiblePages - 3) {
        startPage = Math.max(2, endPage - maxVisiblePages + 3);
      }

      // Show ellipsis if needed before middle pages
      if (startPage > 2) {
        items.push(
          <BootstrapPagination.Ellipsis key="start-ellipsis" disabled />
        );
      }

      // Show middle pages
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <BootstrapPagination.Item 
            key={i} 
            active={page === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </BootstrapPagination.Item>
        );
      }

      // Show ellipsis if needed before last page
      if (endPage < totalPages - 1) {
        items.push(
          <BootstrapPagination.Ellipsis key="end-ellipsis" disabled />
        );
      }

      // Always show last page if different from first
      if (totalPages > 1) {
        items.push(
          <BootstrapPagination.Item 
            key={totalPages} 
            active={page === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </BootstrapPagination.Item>
        );
      }
    }

    return items;
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className={`pagination-wrapper ${className}`}>
      <div className="d-flex justify-content-between align-items-center flex-wrap">
        <div className="pagination-info mb-2 mb-md-0">
          <span className="text-muted">
            Showing {startItem}-{endItem} of {total} products
          </span>
        </div>

        <div className="d-flex align-items-center">
          {showPageSizeSelector && onPageSizeChange && (
            <div className="page-size-selector me-3">
              <Form.Select 
                size="sm"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                style={{ width: 'auto' }}
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </Form.Select>
            </div>
          )}

          <BootstrapPagination>
            <BootstrapPagination.First 
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
            />
            <BootstrapPagination.Prev 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            />
            
            {getPaginationItems()}
            
            <BootstrapPagination.Next 
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            />
            <BootstrapPagination.Last 
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
            />
          </BootstrapPagination>
        </div>
      </div>
    </div>
  );
};

export default PaginationComponent;
