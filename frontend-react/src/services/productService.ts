import { Product } from '../types/product';

export interface ProductResponse {
  content: Product[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface SearchParams {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdvancedSearchFilters {
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

export const productService = {
  async getProducts(params: SearchParams = {}): Promise<ProductResponse> {
    try {
      const searchParams = new URLSearchParams();

      // Always include page parameter, even if it's 0
      searchParams.append('page', (params.page ?? 0).toString());
      if (params.size) searchParams.append('size', params.size.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.category) searchParams.append('category', params.category);
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`http://localhost:8090/products/products?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });



      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductResponse = await response.json();
      return data;
    } catch (error) {

      throw error;
    }
  },

  async searchProducts(query: string, page: number = 0, size: number = 12): Promise<ProductResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('q', query);
      searchParams.append('page', page.toString());
      searchParams.append('size', size.toString());

      const url = `http://localhost:8090/products/products/search?${searchParams.toString()}`;


      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });



      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductResponse = await response.json();





      return data;
    } catch (error) {

      throw error;
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await fetch(`http://localhost:8090/products/products/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const product: Product = await response.json();
      return product;
    } catch (error) {

      throw error;
    }
  },

  async advancedSearch(filters: AdvancedSearchFilters): Promise<ProductResponse> {
    try {
      // Build request body only with fields that have meaningful values
      const requestBody: any = {};
      
      // Only include keyword if it has a value
      if (filters.keyword && filters.keyword.trim()) {
        requestBody.keyword = filters.keyword.trim();
      }
      
      // Only include minPrice if it's greater than 0
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        requestBody.minPrice = filters.minPrice;
      }
      
      // Only include maxPrice if it's less than 50000 (default max)
      if (filters.maxPrice !== undefined && filters.maxPrice < 50000) {
        requestBody.maxPrice = filters.maxPrice;
      }
      
      // Include inStock if it's explicitly set (either true or false)
      if (filters.inStock !== undefined) {
        requestBody.inStock = filters.inStock;
      }
      
      // Only include brand if it has a value
      if (filters.brand && filters.brand.trim()) {
        requestBody.brand = filters.brand.trim();
      }
      
      // Only include color if it has a value
      if (filters.color && filters.color.trim()) {
        requestBody.color = filters.color.trim();
      }
      
      // Only include minRating if it's greater than 0
      if (filters.minRating !== undefined && filters.minRating > 0) {
        requestBody.minRating = filters.minRating;
      }
      
      // Always include sortBy and sortOrder if specified
      if (filters.sortBy) {
        requestBody.sortBy = filters.sortBy;
      }
      if (filters.sortOrder) {
        requestBody.sortOrder = filters.sortOrder;
      }
      
      // Always include page and size
      requestBody.page = filters.page !== undefined ? filters.page : 0;
      requestBody.size = filters.size !== undefined ? filters.size : 10;

      const response = await fetch('http://localhost:8090/products/products/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductResponse = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch('http://localhost:8090/products/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const categories: string[] = await response.json();
      return categories;
    } catch (error) {

      throw error;
    }
  }
};
