import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductCard from './ProductCard';
import { Product } from '../types/product';

interface ProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  showAddToCart?: boolean;
  loading?: boolean;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductClick,
  showAddToCart = false,
  loading = false,
  columns = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
    xxl: 5
  },
  className = ''
}) => {
  console.log("ProductGrid rendering with products:", products);
  if (loading) {
    return (
      <div className={`product-grid-loading ${className}`}>
        <Row>
          {Array.from({ length: 8 }).map((_, index) => (
            <Col key={index} {...columns}>
              <div className="placeholder-glow">
                <div className="placeholder w-100" style={{ height: '350px' }}></div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`text-center py-5 ${className}`}>
        <h4 className="text-muted">No products found</h4>
        <p className="text-muted">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <Row className={`product-grid ${className}`}>
      {products.map((product) => (
        <Col key={product.id} {...columns}>
          <ProductCard
            product={product}
            onProductClick={onProductClick}
            showAddToCart={showAddToCart}
            className="h-100 mb-4"
          />
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;
