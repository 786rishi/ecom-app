import { Product } from '../types/product';

export interface SearchOptions {
  fields?: ('name' | 'description' | 'category' | 'brand')[];
  caseSensitive?: boolean;
  fuzzy?: boolean;
  minQueryLength?: number;
}

export class ProductSearcher {
  private products: Product[] = [];
  private options: SearchOptions;

  constructor(options: SearchOptions = {}) {
    this.options = {
      fields: ['name', 'description', 'category', 'brand'],
      caseSensitive: false,
      fuzzy: true,
      minQueryLength: 1,
      ...options
    };
  }

  setProducts(products: Product[]): void {
    this.products = products;
  }

  search(query: string): Product[] {
    if (!query || query.length < this.options.minQueryLength!) {
      return this.products;
    }

    const searchTerms = this.prepareSearchTerms(query);
    
    return this.products.filter(product => {
      return this.matchesSearchTerms(product, searchTerms);
    });
  }

  private prepareSearchTerms(query: string): string[] {
    const processedQuery = this.options.caseSensitive ? query : query.toLowerCase();
    return processedQuery
      .split(/\s+/)
      .filter(term => term.length > 0)
      .filter(term => term.length >= this.options.minQueryLength!);
  }

  private matchesSearchTerms(product: Product, searchTerms: string[]): boolean {
    // All search terms must match (AND logic)
    return searchTerms.every(term => {
      return this.options.fields!.some(field => {
        const fieldValue = this.getFieldValue(product, field);
        const processedValue = this.options.caseSensitive ? fieldValue : fieldValue.toLowerCase();
        
        if (this.options.fuzzy) {
          return this.fuzzyMatch(term, processedValue);
        } else {
          return processedValue.includes(term);
        }
      });
    });
  }

  private getFieldValue(product: Product, field: string): string {
    switch (field) {
      case 'name':
        return product.name;
      case 'description':
        return product.description;
      case 'category':
        return product.category;
      case 'brand':
        return product.brand;
      default:
        return '';
    }
  }

  private fuzzyMatch(term: string, text: string): boolean {
    // Simple fuzzy matching - checks if all characters in term appear in order in text
    let termIndex = 0;
    for (let i = 0; i < text.length && termIndex < term.length; i++) {
      if (text[i] === term[termIndex]) {
        termIndex++;
      }
    }
    return termIndex === term.length;
  }

  // Advanced search with scoring
  searchWithScore(query: string): Array<{ product: Product; score: number }> {
    if (!query || query.length < this.options.minQueryLength!) {
      return this.products.map(product => ({ product, score: 0 }));
    }

    const searchTerms = this.prepareSearchTerms(query);
    
    return this.products
      .map(product => ({
        product,
        score: this.calculateScore(product, searchTerms)
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private calculateScore(product: Product, searchTerms: string[]): number {
    let score = 0;
    
    searchTerms.forEach(term => {
      this.options.fields!.forEach(field => {
        const fieldValue = this.getFieldValue(product, field);
        const processedValue = this.options.caseSensitive ? fieldValue : fieldValue.toLowerCase();
        
        // Exact match gets highest score
        if (processedValue === term) {
          score += 100;
        }
        // Starts with term gets high score
        else if (processedValue.startsWith(term)) {
          score += 50;
        }
        // Contains term gets medium score
        else if (processedValue.includes(term)) {
          score += 25;
        }
        // Fuzzy match gets low score
        else if (this.options.fuzzy && this.fuzzyMatch(term, processedValue)) {
          score += 10;
        }
        
        // Bonus for name field matches
        if (field === 'name' && processedValue.includes(term)) {
          score += 20;
        }
      });
    });
    
    return score;
  }
}

// Utility function for simple search
export const searchProducts = (
  products: Product[], 
  query: string, 
  options?: SearchOptions
): Product[] => {
  const searcher = new ProductSearcher(options);
  searcher.setProducts(products);
  return searcher.search(query);
};

// Utility function for search with suggestions
export const getSearchSuggestions = (
  products: Product[], 
  query: string, 
  maxSuggestions: number = 5
): string[] => {
  if (!query || query.length < 2) return [];
  
  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();
  
  products.forEach(product => {
    // Add category suggestions
    if (product.category.toLowerCase().includes(queryLower)) {
      suggestions.add(product.category);
    }
    
    // Add brand suggestions
    if (product.brand?.toLowerCase().includes(queryLower)) {
      suggestions.add(product.brand);
    }
    
    // Add name suggestions (first word)
    const firstWord = product.name.split(' ')[0];
    if (firstWord.toLowerCase().includes(queryLower)) {
      suggestions.add(firstWord);
    }
  });
  
  return Array.from(suggestions).slice(0, maxSuggestions);
};
