import { ProductFilter, ProductSort } from '../types/product';

export interface SearchParams {
  query?: string;
  page?: number;
  pageSize?: number;
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
  brand?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class URLManager {
  private static readonly SEARCH_PARAM = 'q';
  private static readonly PAGE_PARAM = 'page';
  private static readonly PAGE_SIZE_PARAM = 'pageSize';
  private static readonly CATEGORY_PARAM = 'category';
  private static readonly MIN_PRICE_PARAM = 'minPrice';
  private static readonly MAX_PRICE_PARAM = 'maxPrice';
  private static readonly BRAND_PARAM = 'brand';
  private static readonly SORT_BY_PARAM = 'sortBy';
  private static readonly SORT_ORDER_PARAM = 'sortOrder';

  // Get current search parameters from URL
  static getSearchParams(): SearchParams {
    const params = new URLSearchParams(window.location.search);
    
    return {
      query: params.get(this.SEARCH_PARAM) || undefined,
      page: params.get(this.PAGE_PARAM) ? parseInt(params.get(this.PAGE_PARAM)!) : 1,
      pageSize: params.get(this.PAGE_SIZE_PARAM) ? parseInt(params.get(this.PAGE_SIZE_PARAM)!) : 12,
      category: params.get(this.CATEGORY_PARAM) ? params.get(this.CATEGORY_PARAM)!.split(',') : undefined,
      minPrice: params.get(this.MIN_PRICE_PARAM) ? parseFloat(params.get(this.MIN_PRICE_PARAM)!) : undefined,
      maxPrice: params.get(this.MAX_PRICE_PARAM) ? parseFloat(params.get(this.MAX_PRICE_PARAM)!) : undefined,
      brand: params.get(this.BRAND_PARAM) ? params.get(this.BRAND_PARAM)!.split(',') : undefined,
      sortBy: params.get(this.SORT_BY_PARAM) || undefined,
      sortOrder: params.get(this.SORT_ORDER_PARAM) as 'asc' | 'desc' || undefined
    };
  }

  // Update URL with search parameters
  static updateSearchParams(params: Partial<SearchParams>): void {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Update each parameter if provided
    if (params.query !== undefined) {
      if (params.query) {
        urlParams.set(this.SEARCH_PARAM, params.query);
      } else {
        urlParams.delete(this.SEARCH_PARAM);
      }
    }
    
    if (params.page !== undefined) {
      if (params.page && params.page !== 1) {
        urlParams.set(this.PAGE_PARAM, params.page.toString());
      } else {
        urlParams.delete(this.PAGE_PARAM);
      }
    }
    
    if (params.pageSize !== undefined) {
      if (params.pageSize && params.pageSize !== 12) {
        urlParams.set(this.PAGE_SIZE_PARAM, params.pageSize.toString());
      } else {
        urlParams.delete(this.PAGE_SIZE_PARAM);
      }
    }
    
    if (params.category !== undefined) {
      if (params.category && params.category.length > 0) {
        urlParams.set(this.CATEGORY_PARAM, params.category.join(','));
      } else {
        urlParams.delete(this.CATEGORY_PARAM);
      }
    }
    
    if (params.minPrice !== undefined) {
      if (params.minPrice !== undefined && params.minPrice > 0) {
        urlParams.set(this.MIN_PRICE_PARAM, params.minPrice.toString());
      } else {
        urlParams.delete(this.MIN_PRICE_PARAM);
      }
    }
    
    if (params.maxPrice !== undefined) {
      if (params.maxPrice !== undefined && params.maxPrice > 0) {
        urlParams.set(this.MAX_PRICE_PARAM, params.maxPrice.toString());
      } else {
        urlParams.delete(this.MAX_PRICE_PARAM);
      }
    }
    
    if (params.brand !== undefined) {
      if (params.brand && params.brand.length > 0) {
        urlParams.set(this.BRAND_PARAM, params.brand.join(','));
      } else {
        urlParams.delete(this.BRAND_PARAM);
      }
    }
    
    if (params.sortBy !== undefined) {
      if (params.sortBy) {
        urlParams.set(this.SORT_BY_PARAM, params.sortBy);
      } else {
        urlParams.delete(this.SORT_BY_PARAM);
      }
    }
    
    if (params.sortOrder !== undefined) {
      if (params.sortOrder) {
        urlParams.set(this.SORT_ORDER_PARAM, params.sortOrder);
      } else {
        urlParams.delete(this.SORT_ORDER_PARAM);
      }
    }
    
    // Update URL without page reload
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  }

  // Convert URL params to filter object
  static paramsToFilter(params: SearchParams): ProductFilter {
    return {
      categories: params.category || [],
      priceRange: {
        min: params.minPrice || 0,
        max: params.maxPrice || Infinity
      },
      brands: params.brand || [],
      attributes: {},
      inStockOnly: false
    };
  }

  // Convert URL params to sort object
  static paramsToSort(params: SearchParams): ProductSort {
    return {
      field: (params.sortBy as any) || 'name',
      direction: params.sortOrder || 'asc'
    };
  }

  // Get full URL with parameters (useful for sharing)
  static getShareableURL(baseURL?: string): string {
    const currentURL = window.location.href;
    return baseURL ? new URL(currentURL).pathname + window.location.search : currentURL;
  }

  // Clear all search parameters
  static clearAllParams(): void {
    window.history.pushState({}, '', window.location.pathname);
  }

  // Check if there are any active filters
  static hasActiveFilters(): boolean {
    const params = this.getSearchParams();
    return !!(
      params.query ||
      params.category?.length ||
      params.minPrice ||
      params.maxPrice ||
      params.brand?.length ||
      (params.sortBy && params.sortBy !== 'name') ||
      (params.sortOrder && params.sortOrder !== 'asc') ||
      (params.page && params.page !== 1) ||
      (params.pageSize && params.pageSize !== 12)
    );
  }

  // Get filter summary for display
  static getFilterSummary(): string[] {
    const params = this.getSearchParams();
    const summary: string[] = [];
    
    if (params.query) {
      summary.push(`Search: "${params.query}"`);
    }
    
    if (params.category?.length) {
      summary.push(`Categories: ${params.category.join(', ')}`);
    }
    
    if (params.brand?.length) {
      summary.push(`Brands: ${params.brand.join(', ')}`);
    }
    
    if (params.minPrice || params.maxPrice) {
      const priceRange = `$${params.minPrice || 0} - $${params.maxPrice || '∞'}`;
      summary.push(`Price: ${priceRange}`);
    }
    
    if (params.sortBy) {
      summary.push(`Sort: ${params.sortBy} ${params.sortOrder || 'asc'}`);
    }
    
    return summary;
  }
}
