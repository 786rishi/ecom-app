import React from 'react';
import { Card, Button, Badge, Toast } from 'react-bootstrap';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import ProtectedComponent from './ProtectedComponent';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
  showAddToCart?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  showAddToCart = false,
  className = ''
}) => {

    console.log("ProductCard rendering with product:", product);

  const { addToCart } = useCart();
  const [showToast, setShowToast] = React.useState(false);

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setShowToast(true);
  };

  return (
    <>
      <Card 
        className={`product-card h-100 ${className}`}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="position-relative">
          <Card.Img 
            variant="top" 
            src={product.image} 
            alt={product.name}
            style={{ height: '200px', objectFit: 'cover' }}
          />
          {!product.inStock && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
              <Badge bg="secondary" className="fs-6">Out of Stock</Badge>
            </div>
          )}
        </div>
        
        <Card.Body className="d-flex flex-column">
          <Card.Title className="fs-6 text-truncate" title={product.name}>
            {product.name}
          </Card.Title>
          
          <Card.Text className="text-muted small flex-grow-1">
            {product.description.length > 100 
              ? `${product.description.substring(0, 100)}...`
              : product.description
            }
          </Card.Text>
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold text-primary">${product.price.toFixed(2)}</span>
            <Badge bg="light" text="dark" className="small">
              {product.category}
            </Badge>
          </div>
          
          {product.rating && (
            <div className="d-flex align-items-center mb-2">
              <div className="text-warning me-1">
                {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <small className="text-muted">({product.reviews || 0})</small>
            </div>
          )}
          
          {showAddToCart && (
            <ProtectedComponent>
              <Button 
                variant="primary" 
                className="w-100 mt-auto"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </ProtectedComponent>
          )}
        </Card.Body>
      </Card>

      {/* Toast Notification */}
      <Toast 
        onClose={() => setShowToast(false)} 
        show={showToast} 
        delay={3000} 
        autohide
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999
        }}
      >
        <Toast.Header>
          <strong className="me-auto">Added to Cart!</strong>
          <small>just now</small>
        </Toast.Header>
        <Toast.Body>
          {product.name} has been added to your cart.
        </Toast.Body>
      </Toast>
    </>
  );
};

export default ProductCard;
