import React from 'react';
import { ListGroup, Button, Badge, Image, Toast } from 'react-bootstrap';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import ProtectedComponent from './ProtectedComponent';

interface ProductListProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  showAddToCart?: boolean;
  loading?: boolean;
  className?: string;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onProductClick,
  showAddToCart = false,
  loading = false,
  className = ''
}) => {
  const { addToCart } = useCart();
  const [showToast, setShowToast] = React.useState(false);
  const [toastProduct, setToastProduct] = React.useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product);
    setToastProduct(product);
    setShowToast(true);
  };

  if (loading) {
    return (
      <div className={`product-list-loading ${className}`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <ListGroup.Item key={index} className="placeholder-glow mb-3">
            <div className="d-flex align-items-center">
              <div className="placeholder me-3" style={{ width: '80px', height: '80px' }}></div>
              <div className="flex-grow-1">
                <div className="placeholder w-50 mb-2" style={{ height: '20px' }}></div>
                <div className="placeholder w-75 mb-2" style={{ height: '16px' }}></div>
                <div className="placeholder w-25" style={{ height: '16px' }}></div>
              </div>
              <div className="placeholder" style={{ width: '100px', height: '40px' }}></div>
            </div>
          </ListGroup.Item>
        ))}
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
    <>
    <ListGroup className={`product-list ${className}`}>
      {products.map((product) => (
        <ListGroup.Item 
          key={product.id}
          action
          onClick={() => handleProductClick(product)}
          className="mb-3"
        >
          <div className="d-flex align-items-center">
            <Image 
              src={product.image} 
              alt={product.name}
              rounded
              style={{ 
                width: '80px', 
                height: '80px', 
                objectFit: 'cover',
                marginRight: '1rem'
              }}
            />
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="mb-0">{product.name}</h5>
                <div className="d-flex flex-column align-items-end">
                  <span className="fw-bold text-primary fs-5">
                    ${product.price.toFixed(2)}
                  </span>
                  <Badge bg="light" text="dark" className="mt-1">
                    {product.category}
                  </Badge>
                </div>
              </div>
              
              <p className="text-muted mb-2">
                {product.description.length > 150 
                  ? `${product.description.substring(0, 150)}...`
                  : product.description
                }
              </p>
              
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <small className="text-muted me-2">Brand: {product.brand}</small>
                  {product.rating && (
                    <div className="d-flex align-items-center">
                      <div className="text-warning me-1 small">
                        {'★'.repeat(Math.floor(product.rating))}
                      </div>
                      <small className="text-muted">({product.reviews || 0})</small>
                    </div>
                  )}
                </div>
                
                <div className="d-flex align-items-center">
                  {!product.inStock && (
                    <Badge bg="secondary" className="me-2">Out of Stock</Badge>
                  )}
                  {showAddToCart && (
                    <ProtectedComponent>
                      <Button 
                        variant="primary" 
                        size="sm"
                        disabled={!product.inStock}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </ProtectedComponent>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>

    {/* Toast Notification */}
    {toastProduct && (
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
          {toastProduct.name} has been added to your cart.
        </Toast.Body>
      </Toast>
    )}
    </>
  );
};

export default ProductList;
