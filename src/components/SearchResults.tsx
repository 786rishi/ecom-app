import React from 'react';
import { Alert, Button, Card, Toast } from 'react-bootstrap';
import { Product } from '../types/product';
import { getSearchSuggestions } from '../utils/search';

interface SearchResultsProps {
  products: Product[];
  allProducts: Product[];
  query: string;
  loading?: boolean;
  onClearSearch?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  products,
  allProducts,
  query,
  loading = false,
  onClearSearch,
  onSuggestionClick,
  className = ''
}) => {
  const suggestions = getSearchSuggestions(allProducts, query);

  if (loading) {
    return (
      <div className={`search-results-loading ${className}`}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className={`search-results-empty ${className}`}>
        <Alert variant="info" className="text-center">
          <Alert.Heading>Start Searching</Alert.Heading>
          <p>
            Enter a search term to find products. You can search by product name, 
            description, category, or brand.
          </p>
        </Alert>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`search-results-no-results ${className}`}>
        <Alert variant="warning" className="text-center">
          <Alert.Heading>No Results Found</Alert.Heading>
          <p className="mb-3">
            We couldn't find any products matching "<strong>{query}</strong>"
          </p>
          
          {suggestions.length > 0 && (
            <div className="search-suggestions mb-3">
              <p className="mb-2">Try searching for:</p>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onSuggestionClick?.(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="search-tips">
            <p className="mb-2 fw-bold">Search tips:</p>
            <ul className="text-start small">
              <li>Check your spelling</li>
              <li>Try more general terms</li>
              <li>Try different keywords</li>
              <li>Use fewer words</li>
            </ul>
          </div>
          
          {onClearSearch && (
            <div className="mt-3">
              <Button variant="secondary" onClick={onClearSearch}>
                Clear Search
              </Button>
            </div>
          )}
        </Alert>
      </div>
    );
  }

  return (
    <div className={`search-results-success ${className}`}>
      <Alert variant="success" className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Alert.Heading className="h5 mb-1">
              Found {products.length} product{products.length !== 1 ? 's' : ''}
            </Alert.Heading>
            <p className="mb-0">
              Results for "<strong>{query}</strong>"
            </p>
          </div>
          {onClearSearch && (
            <Button variant="outline-secondary" size="sm" onClick={onClearSearch}>
              Clear Search
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
};

// Additional component for search suggestions dropdown
export const SearchSuggestions: React.FC<{
  query: string;
  products: Product[];
  onSuggestionClick: (suggestion: string) => void;
  maxSuggestions?: number;
  className?: string;
}> = ({ 
  query, 
  products, 
  onSuggestionClick, 
  maxSuggestions = 5,
  className = '' 
}) => {
  const suggestions = getSearchSuggestions(products, query, maxSuggestions);

  if (!query || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={`search-suggestions-dropdown ${className}`}>
      <Card.Body className="p-2">
        <div className="small text-muted mb-2">Suggestions:</div>
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="link"
            size="sm"
            className="d-block text-start w-100 py-1 px-2 text-decoration-none"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </Card.Body>
    </Card>
  );
};

export default SearchResults;
