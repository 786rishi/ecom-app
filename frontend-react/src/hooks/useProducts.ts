import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, ProductFilter, ProductSort, PaginationInfo } from '../types/product';
import { searchProducts } from '../utils/search';
import { URLManager } from '../utils/url';
import { productService, SearchParams } from '../services/productService';

interface UseProductsOptions {
  autoLoad?: boolean;
  pageSize?: number;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { autoLoad = true, pageSize = 12 } = options;
  const isLoadingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false); // Track if we're in search mode
  const [filter, setFilter] = useState<ProductFilter>({
    categories: [],
    priceRange: { min: 0, max: Infinity },
    brands: [],
    attributes: {},
    inStockOnly: false
  });
  const [sort, setSort] = useState<ProductSort>({ field: 'name', direction: 'asc' });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize,
    total: 0,
    totalPages: 0
  });

  // Debounced search function
  // const debouncedSearch = useCallback((query: string) => {
  //   // Clear previous timeout
  //   if (searchTimeoutRef.current) {
  //     clearTimeout(searchTimeoutRef.current);
  //   }

  //   // Set new timeout
  //   searchTimeoutRef.current = setTimeout(async () => {
  //     if (query.trim()) {
  //       setIsSearching(true);
  //       try {
  //         // Use current state values directly instead of dependencies
  //         const currentPage = pagination.page;
  //         const currentPageSize = pagination.pageSize;

  //         const response = await productService.searchProducts(query, currentPage - 1, currentPageSize);
  //         console.log('Search API Response:', response);

  //         setAllProducts(response.content);
  //         setFilteredProducts(response.content);

  //         // Update pagination with search response
  //         setPagination(prev => {
  //           const newPagination = {
  //             page: response.number + 1,
  //             pageSize: response.size,
  //             total: response.totalElements,
  //             totalPages: response.totalPages
  //           };

  //           // ✅ prevent re-render if no change
  //           if (
  //             prev.page === newPagination.page &&
  //             prev.pageSize === newPagination.pageSize &&
  //             prev.total === newPagination.total &&
  //             prev.totalPages === newPagination.totalPages
  //           ) {
  //             return prev;
  //           }

  //           return newPagination;
  //         });
  //       } catch (err) {
  //         setError('Failed to search products');
  //         console.error('Error searching products:', err);
  //       } finally {
  //         setIsSearching(false);
  //       }
  //     } else {
  //       // If query is empty, load all products
  //       setSearchQuery('');

  //       //loadProducts();
  //     }
  //   }, 300); // 300ms debounce time
  // }, [pagination.page, pagination.pageSize]); // Remove all dependencies to prevent circular dependency

  const latestQueryRef = useRef('');

  const paginationRef = useRef(pagination);

useEffect(() => {
  paginationRef.current = pagination;
}, [pagination]);

useEffect(() => {
  return () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };
}, []);

const debouncedSearch = useCallback((query: string) => {
  // Don't search if query is the same as before
  if (latestQueryRef.current === query) {
    return;
  }
  
  latestQueryRef.current = query;

  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }

  // Handle empty query - exit search mode and load all products
  if (query.trim().length === 0) {
    console.log('Search query is empty, exiting search mode');
    setSearchQuery('');
    setIsSearchMode(false); // Exit search mode
    loadProducts(); // Load all products when search is empty
    return;
  }

  // Enter search mode
  setIsSearchMode(true);

  searchTimeoutRef.current = setTimeout(async () => {
    // Double check query is still valid and hasn't changed
    if (!query.trim() || latestQueryRef.current !== query) {
      return;
    }

    console.log('Starting search for:', query);
    setIsSearching(true);

    try {
      const { page, pageSize } = paginationRef.current;

      const response = await productService.searchProducts(
        query,
        page - 1,
        pageSize
      );

      // Prevent stale response overwrite
      if (latestQueryRef.current !== query) {
        console.log('Stale response detected, ignoring');
        return;
      }

      console.log('Search completed for:', query);
      console.log('Search results:', response);
       
      // Only show search results, not mix with old products
      setAllProducts(response);
      setFilteredProducts(response);

      // For search results, we need to handle pagination differently
      // Since the API returns Product[] directly, we'll maintain current pagination
      // but update the total based on the response length
      setPagination(prev => {
        const updatedPagination = {
          ...prev,
          total: response.length, // Update total with actual result count
          totalPages: Math.ceil(response.length / prev.pageSize) // Calculate total pages
        };
        
        console.log('Updated pagination for search:', updatedPagination);
        return updatedPagination;
      });

    } catch (err) {
      console.error('Search error:', err);
      if (latestQueryRef.current === query) {
        setError('Failed to search products');
      }
    } finally {
      if (latestQueryRef.current === query) {
        setIsSearching(false);
      }
    }
  }, 300);
}, []); // No dependencies

  // Load products
  const loadProducts = useCallback(async () => {
    // Don't load all products if we're in search mode
    if (isSearchMode) {
      console.log('Skipping loadProducts - in search mode');
      return;
    }

    if (isLoadingRef.current) return; // Prevent duplicate calls
    isLoadingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      // Use current state values instead of dependencies
      const currentPage = pagination.page;
      const currentPageSize = pagination.pageSize;
      const currentSearchQuery = searchQuery;
      const currentCategories = filter.categories;
      const currentSortField = sort.field;
      const currentSortDirection = sort.direction;

      const params: SearchParams = {
        page: currentPage - 1, // API uses 0-based indexing
        size: currentPageSize,
        search: currentSearchQuery || undefined,
        category: currentCategories.length > 0 ? currentCategories[0] : undefined,
        sortBy: currentSortField,
        sortOrder: currentSortDirection
      };

      // Only log once to avoid spam
      if (!(window as any).debugLogged) {
        console.log('API Parameters being sent:', params);
        console.log('Current state:', {
          pagination,
          searchQuery,
          filter,
          sort
        });
        (window as any).debugLogged = true;
      }

      const response = await productService.getProducts(params);

      console.log('API Response:', response);
      console.log('Products from API:', response.content);

      setAllProducts(response.content);
      setFilteredProducts(response.content);

      // Update pagination with API response
      setPagination(prev => {
        const newPagination = {
          page: response.number + 1,
          pageSize: response.size,
          total: response.totalElements,
          totalPages: response.totalPages
        };

        // ✅ prevent re-render if no change
        if (
          prev.page === newPagination.page &&
          prev.pageSize === newPagination.pageSize &&
          prev.total === newPagination.total &&
          prev.totalPages === newPagination.totalPages
        ) {
          return prev;
        }

        return newPagination;
      });

    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []); // Remove all dependencies to prevent circular dependency

  // Update search query
  // const updateSearchQuery = useCallback((query: string) => {
  //   setSearchQuery(prev => (prev === query ? prev : query));
  //   setPagination(prev => (prev.page === 1 ? prev : { ...prev, page: 1 }));

  //   //URLManager.updateSearchParams({ query, page: 1 });

  //   // Use debounced search
  //   debouncedSearch(query);
  // }, [debouncedSearch]);

  const updateSearchQuery = useCallback((query: string) => {
  console.log('updateSearchQuery called with:', query);
  
  // Update search query state
  setSearchQuery(prev => (prev === query ? prev : query));

  // Reset pagination to page 1 when searching
  setPagination(prev =>
    prev.page === 1 ? prev : { ...prev, page: 1 }
  );

  // Update URL params
  URLManager.updateSearchParams({ query, page: 1 });

  // Trigger debounced search
  debouncedSearch(query);
}, []); // Remove debouncedSearch dependency

  // Update filter
  const updateFilter = useCallback((newFilter: Partial<ProductFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);

    // Update URL
    const urlParams = {
      category: updatedFilter.categories.length > 0 ? updatedFilter.categories : undefined,
      minPrice: updatedFilter.priceRange.min > 0 ? updatedFilter.priceRange.min : undefined,
      maxPrice: updatedFilter.priceRange.max < Infinity ? updatedFilter.priceRange.max : undefined,
      brand: updatedFilter.brands.length > 0 ? updatedFilter.brands : undefined,
      page: 1
    };
    URLManager.updateSearchParams(urlParams);
  }, [filter]);

  // Update sort
  const updateSort = useCallback((newSort: Partial<ProductSort>) => {
    const updatedSort = { ...sort, ...newSort };
    setSort(updatedSort);

    // Update URL
    URLManager.updateSearchParams({
      sortBy: updatedSort.field,
      sortOrder: updatedSort.direction,
      page: 1
    });
  }, [sort]);

  // Update page
  const updatePage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    URLManager.updateSearchParams({ page });
  }, []);

  // Update page size
  const updatePageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
    URLManager.updateSearchParams({ pageSize, page: 1 });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilter({
      categories: [],
      priceRange: { min: 0, max: Infinity },
      brands: [],
      attributes: {},
      inStockOnly: false
    });
    setSearchQuery('');
    setSort({ field: 'name', direction: 'asc' });
    setPagination(prev => ({ ...prev, page: 1 }));
    URLManager.clearAllParams();
  }, []);

  // Initialize from URL and load products on mount
  useEffect(() => {
    const urlParams = URLManager.getSearchParams();

    if (urlParams.query) setSearchQuery(urlParams.query);
    if (urlParams.page) setPagination(prev => ({ ...prev, page: urlParams.page || 1 }));
    if (urlParams.pageSize) setPagination(prev => ({ ...prev, pageSize: urlParams.pageSize || 12 }));

    if (urlParams.category || urlParams.minPrice || urlParams.maxPrice || urlParams.brand) {
      setFilter(URLManager.paramsToFilter(urlParams));
    }

    if (urlParams.sortBy || urlParams.sortOrder) {
      setSort(URLManager.paramsToSort(urlParams));
    }

    // Load products on mount with URL params
    if (autoLoad) {
      loadProducts();
    }
  }, [autoLoad]); // Only run on mount

  // Ref to track previous parameters for non-search changes
  const prevParamsRef = useRef({
    page: 1,
    pageSize: 12,
    categories: [] as string[],
    sortField: 'name',
    sortDirection: 'asc'
  });

  // Separate useEffect for non-search parameter changes (filters, sort, pagination)
  useEffect(() => {
    const currentParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      categories: filter.categories,
      sortField: sort.field,
      sortDirection: sort.direction
    };

    const prevParams = prevParamsRef.current;

    // Check if any parameter actually changed (excluding search)
    const paramsChanged = 
      currentParams.page !== prevParams.page ||
      currentParams.pageSize !== prevParams.pageSize ||
      JSON.stringify(currentParams.categories) !== JSON.stringify(prevParams.categories) ||
      currentParams.sortField !== prevParams.sortField ||
      currentParams.sortDirection !== prevParams.sortDirection;

    if (paramsChanged && autoLoad && !isLoadingRef.current) {
      prevParamsRef.current = currentParams;
      
      console.log('Parameters changed, loading products:', currentParams);
      
      // If we're in search mode, trigger search with new parameters
      if (isSearchMode && searchQuery.trim()) {
        console.log('In search mode, triggering search with new parameters');
        debouncedSearch(searchQuery);
      } else {
        console.log('In normal mode, loading all products');
        loadProducts();
      }
    }
  }, [pagination.page, pagination.pageSize, filter.categories, sort.field, sort.direction, autoLoad, isSearchMode, searchQuery]);

  const result = {
    products: filteredProducts,
    allProducts: allProducts,
    loading: loading || isSearching,
    error,
    searchQuery,
    filter,
    sort,
    pagination,
    isSearching,
    isSearchMode,
    updateSearchQuery,
    updateFilter,
    updateSort,
    updatePage,
    updatePageSize,
    clearFilters,
    refetch: loadProducts
  };

  return result;
};
