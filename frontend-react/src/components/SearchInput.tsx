import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

interface SearchInputProps {
  value?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  debounceMs?: number;
  showClearButton?: boolean;
  size?: 'sm' | 'lg';
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value: initialValue = '',
  placeholder = 'Search products...',
  onSearch,
  debounceMs = 300,
  showClearButton = true,
  size,
  className = ''
}) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs]);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  // Update internal value when initialValue prop changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleClear = () => {
    setValue('');
    setDebouncedValue('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Force immediate search on Enter
      setDebouncedValue(value);
      if (onSearch) {
        onSearch(value);
      }
    }
  };

  const handleBlur = () => {
    // Trigger search when input loses focus
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <InputGroup size={size} className={className}>
      <Form.Control
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-label="Search products"
        aria-describedby="search-clear-button"
      />
      {showClearButton && value && (
        <Button
          variant="outline-secondary"
          id="search-clear-button"
          onClick={handleClear}
          aria-label="Clear search"
        >
          ×
        </Button>
      )}
    </InputGroup>
  );
};

export default SearchInput;
