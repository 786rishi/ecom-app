import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Button, 
  Row, 
  Col, 
  Modal,
  Badge,
  InputGroup,
  Spinner
} from 'react-bootstrap';
import { Product } from '../types/product';

export interface SearchFilters {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  brand?: string;
  color?: string;
  minRating?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  size?: number;
}

interface AdvanceFilterProps {
  onFiltersApply: (filters: SearchFilters) => void;
  onFiltersClear: () => void;
  show: boolean;
  onHide: () => void;
  loading?: boolean;
  currentFilters?: SearchFilters;
}

const AdvanceFilter: React.FC<AdvanceFilterProps> = ({
  onFiltersApply,
  onFiltersClear,
  show,
  onHide,
  loading = false,
  currentFilters = {}
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: currentFilters.keyword || '',
    minPrice: currentFilters.minPrice || 0,
    maxPrice: currentFilters.maxPrice || 50000,
    inStock: currentFilters.inStock !== undefined ? currentFilters.inStock : true,
    brand: currentFilters.brand || '',
    color: currentFilters.color || '',
    minRating: currentFilters.minRating || 0,
    sortBy: currentFilters.sortBy || 'price',
    sortOrder: currentFilters.sortOrder || 'asc',
    page: currentFilters.page || 0,
    size: currentFilters.size || 10
  });

  const handleInputChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    // Construct the search request
    const searchRequest: SearchFilters = {
      keyword: filters.keyword || undefined,
      minPrice: filters.minPrice ?? 0,
      maxPrice: filters.maxPrice ?? 50000,
      inStock: filters.inStock,
      brand: filters.brand || undefined,
      color: filters.color || undefined,
      minRating: filters.minRating ?? undefined,
      sortBy: filters.sortBy || 'price',
      sortOrder: filters.sortOrder || 'asc',
      page: 0, // Reset to first page when applying new filters
      size: filters.size || 10
    };

    // Remove undefined values
    Object.keys(searchRequest).forEach(key => {
      if (searchRequest[key as keyof SearchFilters] === undefined) {
        delete searchRequest[key as keyof SearchFilters];
      }
    });

    onFiltersApply(searchRequest);
  };

  const handleClear = () => {
    setFilters({
      keyword: '',
      minPrice: 0,
      maxPrice: 50000,
      inStock: true,
      brand: '',
      color: '',
      minRating: 0,
      sortBy: 'price',
      sortOrder: 'asc',
      page: 0,
      size: 10
    });
    onFiltersClear();
  };

  const hasActiveFilters = () => {
    return filters.brand || 
           filters.color || 
           filters.keyword || 
           (filters.minPrice !== undefined && filters.minPrice > 0) || 
           (filters.maxPrice !== undefined && filters.maxPrice < 50000) || 
           (filters.minRating !== undefined && filters.minRating > 0) ||
           !filters.inStock;
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Advanced Filters
          {hasActiveFilters() && (
            <Badge bg="danger" className="ms-2">
              Active
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Row>
          {/* Keyword Search */}
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Keyword</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search products..."
                value={filters.keyword || ''}
                onChange={(e) => handleInputChange('keyword', e.target.value)}
              />
            </Form.Group>
          </Col>

          {/* Brand */}
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter brand name"
                value={filters.brand || ''}
                onChange={(e) => handleInputChange('brand', e.target.value)}
              />
            </Form.Group>
          </Col>

          {/* Color */}
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Color</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter color"
                value={filters.color || ''}
                onChange={(e) => handleInputChange('color', e.target.value)}
              />
            </Form.Group>
          </Col>

          {/* Price Range */}
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Price Range</Form.Label>
              <InputGroup className="mb-2">
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  min="0"
                  max="50000"
                  placeholder="Min"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => handleInputChange('minPrice', parseInt(e.target.value) || 0)}
                />
                <InputGroup.Text>-</InputGroup.Text>
                <Form.Control
                  type="number"
                  min="0"
                  max="50000"
                  placeholder="Max"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => handleInputChange('maxPrice', parseInt(e.target.value) || 50000)}
                />
              </InputGroup>
            </Form.Group>
          </Col>

          {/* Minimum Rating */}
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Minimum Rating</Form.Label>
              <Form.Select
                value={filters.minRating ?? 0}
                onChange={(e) => handleInputChange('minRating', parseInt(e.target.value))}
              >
                <option value="0">All Ratings</option>
                <option value="1">1 Star & Up</option>
                <option value="2">2 Stars & Up</option>
                <option value="3">3 Stars & Up</option>
                <option value="4">4 Stars & Up</option>
                <option value="5">5 Stars Only</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Sort Options */}
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Sort By</Form.Label>
              <Row>
                <Col md={6}>
                  <Form.Select
                    value={filters.sortBy || 'price'}
                    onChange={(e) => handleInputChange('sortBy', e.target.value)}
                  >
                    <option value="price">Price</option>
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                    <option value="brand">Brand</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={filters.sortOrder || 'asc'}
                    onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                  >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </Form.Select>
                </Col>
              </Row>
            </Form.Group>
          </Col>

          {/* In Stock Checkbox */}
          <Col md={12} className="mb-3">
            <Form.Check
              type="checkbox"
              id="inStock"
              label="In Stock Only"
              checked={filters.inStock || false}
              onChange={(e) => handleInputChange('inStock', e.target.checked)}
            />
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={handleClear}
          disabled={loading}
        >
          Clear Filters
        </Button>
        <Button
          variant="secondary"
          onClick={onHide}
        >
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleApply}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Applying...
            </>
          ) : (
            'Apply Filters'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdvanceFilter;
