export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  image: string;
  images?: string[];
  attributes: ProductAttribute[];
  inStock: boolean;
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
  active?: boolean;
  featured?: boolean;
  featureStart?: string;
  featureEnd?: string;
  availableQuantity?: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
  type: 'size' | 'color' | 'material' | 'other';
}

export interface ProductFilter {
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  brands: string[];
  attributes: {
    [key: string]: string[];
  };
  inStockOnly: boolean;
}

export interface ProductSort {
  field: 'name' | 'price' | 'rating' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SearchResult {
  products: Product[];
  pagination: PaginationInfo;
  filters: ProductFilter;
  sort: ProductSort;
}
