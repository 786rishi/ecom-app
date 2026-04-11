import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, ProductFilter, ProductSort, PaginationInfo } from '../types/product';
import { searchProducts } from '../utils/search';
import { URLManager } from '../utils/url';
import { productService, SearchParams } from '../services/productService';

let hookCallCounter = 0;

interface UseProductsOptions {
  autoLoad?: boolean;
  pageSize?: number;
  onStateChange?: () => void; // Callback to notify component of state changes
}

// Global ref to store the notification callback
const stateChangeCallbackRef = { current: null as (() => void) | null };

export const setStateChangeCallback = (callback: () => void) => {
  stateChangeCallbackRef.current = callback;
};

export const useProducts = (options: UseProductsOptions = {}) => {
  hookCallCounter++;
  const { autoLoad = true, pageSize = 12 } = options;
  const isLoadingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setFilteredProducts] = useState<Product[]>([]);
  let filteredProducts_: Product[] = [];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stateVersion, setStateVersion] = useState(0); // Version number to force component re-renders
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

  const latestQueryRef = useRef('');
  const searchQueryRef = useRef('');

  const paginationRef = useRef(pagination);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const debouncedSearch = useCallback(async (query: string) => {
    // Don't search if query is the same as before
    if (latestQueryRef.current === query) {
      return;
    }

    latestQueryRef.current = query;

    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Handle empty query - exit search mode and load all products
    if (query.trim().length === 0) {
      setSearchQuery('');
      setIsSearchMode(false);
      loadProducts();
      return;
    }

    // Enter search mode and search immediately (no debounce delay)
    setIsSearchMode(true);
    setIsSearching(true);
    setAllProducts([]);
    setFilteredProducts([]);
    filteredProducts_ = [];

    try {
      const { page, pageSize } = paginationRef.current;

      setLoading(true);
      const response = await productService.searchProducts(
        query,
        page - 1,
        pageSize
      );

      console.log("response fomr debounced serach:", response)
      // Prevent stale response overwrite
      if (latestQueryRef.current !== query) {
        return;
      }

      // Update search results
      if (response && response.content && Array.isArray(response.content)) {
        console.log("setting products from search result:: ", response.content)
        setAllProducts([...response.content]);
        setFilteredProducts([...response.content]);
        filteredProducts_ = [...response.content];
      }

      // Update pagination with API response but preserve user's selected page
      setPagination(prev => {
                  console.log("setting pagination 1 ", response)
        const updatedPagination = {
          page: response.number + 1, // Keep user's selected page
          pageSize: response.size,
          total: response.totalElements,
          totalPages: response.totalPages
        };
        return updatedPagination;
      });

    } catch (err) {
      if (latestQueryRef.current === query) {
        setError('Failed to search products');
      }
    } finally {
      if (latestQueryRef.current === query) {
        setIsSearching(false);
        setLoading(false);

      }
    }
  }, []); // No dependencies

  // Load products
  const loadProducts = useCallback(async () => {
    if (isLoadingRef.current) return; // Prevent duplicate calls
    isLoadingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      // Use current state values instead of dependencies
      const currentPage = paginationRef.current.page;
      const currentPageSize = paginationRef.current.pageSize;
      const currentSearchQuery = searchQuery;
      const currentCategories = filter.categories;
      const currentSortField = sort.field;
      const currentSortDirection = sort.direction;

      // Check if we have a search query
      if (currentSearchQuery && currentSearchQuery.trim()) {
        // For search queries, use the search API
        setAllProducts([]);
        setFilteredProducts([]);
        console.log("setFilteredProducts: []");
        filteredProducts_ = [];

        const searchResponse = await productService.searchProducts(
          currentSearchQuery,
          currentPage - 1,
          currentPageSize
        );

        // Explicitly set the search results
        if (searchResponse && searchResponse.content && Array.isArray(searchResponse.content)) {
          setAllProducts(searchResponse.content);
          setFilteredProducts(searchResponse.content);
          console.log("setFilteredProducts:", searchResponse.content);
          filteredProducts_ = [...searchResponse.content];
        }

        // Update pagination for search results but preserve user's selected page
        setPagination(prev => {
                            console.log("setting pagination 2 ", searchResponse)

          const updatedPagination = {
            page: prev.page, // Keep user's selected page
            pageSize: searchResponse.size,
            total: searchResponse.totalElements,
            totalPages: searchResponse.totalPages
          };
          return updatedPagination;
        });
      } else {
        // Use general products API for non-search queries (including category filters)
        const params: SearchParams = {
          page: currentPage - 1, // API uses 0-based indexing
          size: currentPageSize,
          category: currentCategories.length > 0 ? currentCategories[0] : undefined,
          sortBy: currentSortField,
          sortOrder: currentSortDirection
        };

        const response = await productService.getProducts(params);

        setAllProducts(response.content);
        setFilteredProducts(response.content);
        filteredProducts_ = [...response.content];

        // Update pagination with API response but preserve user's selected page
        setPagination(prev => {
                            console.log("setting pagination 3 ", response)

          // Preserve the user's selected page number, but update totals from API
          const newPagination = {
            page: response.number + 1, // Keep user's selected page
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
      }

    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []); // Remove all dependencies to prevent circular dependency


  const updateSearchQuery = useCallback((query: string) => {

    console.log("updateSearchQuery:", query)
    // Update search query state
    setSearchQuery(prev => (prev === query ? prev : query));

    // Reset pagination to page 1 when searching
                      console.log("setting pagination 4 ")

    // setPagination(prev =>
    //   prev.page === 1 ? prev : { ...prev, page: 1 }
    // );

    // Update URL params
    URLManager.updateSearchParams({ query, page: 1 });

    // Trigger debounced search
    debugger
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
  // const updatePage = useCallback((page: number) => {
  //   setPagination(prev => ({ ...prev, page }));
  //   URLManager.updateSearchParams({ page });
  // }, []);

  const updatePage = useCallback((page: number) => {
    setPagination(prev => {
                  console.log("setting pagination 5 ")

      if (prev.page === page) return prev; // ✅ prevent loop
      return { ...prev, page };
    });

    URLManager.updateSearchParams({ page });
  }, []);

  // Update page size
  // const updatePageSize = useCallback((pageSize: number) => {
  //   setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  //   URLManager.updateSearchParams({ pageSize, page: 1 });
  // }, []);


  const updatePageSize = useCallback((pageSize: number) => {
    setPagination(prev => {
                        console.log("setting pagination 6")

      if (prev.pageSize === pageSize && prev.page === 1) return prev;
      return { ...prev, pageSize, page: 1 };
    });

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
                      console.log("setting pagination 7 ")

    setPagination(prev => ({ ...prev, page: 1 }));
    URLManager.clearAllParams();
    
    // Trigger fresh data fetch
    loadProducts();
  }, [loadProducts]);

  // Initialize from URL and load products on mount
  useEffect(() => {
    const urlParams = URLManager.getSearchParams();

    if (urlParams.query) setSearchQuery(urlParams.query);
                      console.log("setting pagination 8")

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



      // Always use loadProducts for parameter changes (pagination, filters, sort)
      // loadProducts handles both search and regular product loading
      loadProducts();
    }
  }, [pagination.page, pagination.pageSize, filter.categories, sort.field, sort.direction, autoLoad]);

  // CRITICAL: Whenever products or search state changes, notify component to re-render
  useEffect(() => {

    // Call the callback to notify component it should re-render
    if (stateChangeCallbackRef.current) {

      stateChangeCallbackRef.current();
    }
    setStateVersion(prev => {
      const newVersion = prev + 1;

      return newVersion;
    });
  }, [products.length, searchQuery, loading, isSearching]);

  const result = {
    products,
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
    refetch: loadProducts,
    stateVersion // Include version number so component knows when to re-render
  };


  return result;
};
