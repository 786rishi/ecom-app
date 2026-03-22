import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilter, ProductSort, PaginationInfo } from '../types/product';
import { searchProducts } from '../utils/search';
import { URLManager } from '../utils/url';
import { mockProducts } from '../services/mockDataService';

interface UseProductsOptions {
  autoLoad?: boolean;
  pageSize?: number;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { autoLoad = true, pageSize = 12 } = options;

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
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

  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setAllProducts(mockProducts);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters, search, and sorting
  const applyFiltersAndSearch = useCallback(() => {
    let result = [...allProducts];

    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    fetch(`${baseUrl}/products/actuator/health`, {
      method: "GET"
    })
      .then(response => response.json())
      .then(data => console.log("response:", data))
      .catch(err => console.error("error:", err));

    // Apply search
    if (searchQuery) {
      result = searchProducts(result, searchQuery);
    }

    // Apply filters
    if (filter.categories.length > 0) {
      result = result.filter(product =>
        filter.categories.includes(product.category)
      );
    }

    if (filter.brands.length > 0) {
      result = result.filter(product =>
        filter.brands.includes(product.brand)
      );
    }

    if (filter.priceRange.min > 0) {
      result = result.filter(product => product.price >= filter.priceRange.min);
    }

    if (filter.priceRange.max < Infinity) {
      result = result.filter(product => product.price <= filter.priceRange.max);
    }

    if (filter.inStockOnly) {
      result = result.filter(product => product.inStock);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    // Calculate pagination
    const total = result.length;
    const totalPages = Math.ceil(total / pagination.pageSize);
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedResults = result.slice(startIndex, endIndex);

    setFilteredProducts(paginatedResults);
    setPagination(prev => ({
      ...prev,
      total,
      totalPages
    }));
  }, [allProducts, searchQuery, filter, sort, pagination.page, pagination.pageSize]);

  // Update search query
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    URLManager.updateSearchParams({ query, page: 1 });
  }, []);

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

  // Initialize from URL
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
  }, []);

  // Load products on mount
  useEffect(() => {
    if (autoLoad) {
      loadProducts();
    }
  }, [autoLoad, loadProducts]);

  // Apply filters when dependencies change
  useEffect(() => {
    //if (allProducts.length > 0) 
    {
      applyFiltersAndSearch();
    }
  }, [applyFiltersAndSearch]);

  return {
    products: filteredProducts,
    allProducts: allProducts,
    loading,
    error,
    searchQuery,
    filter,
    sort,
    pagination,
    updateSearchQuery,
    updateFilter,
    updateSort,
    updatePage,
    updatePageSize,
    clearFilters,
    refetch: loadProducts
  };
};
