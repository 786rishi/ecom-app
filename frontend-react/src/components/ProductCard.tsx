import React from 'react';
import { Card, Button, Badge, Toast } from 'react-bootstrap';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProtectedComponent from './ProtectedComponent';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  showAddToCart = false,
  showWishlist = false,
  className = ''
}) => {

  const { addToCart } = useCart();
  const { auth } = useAuth();
  const [showToast, setShowToast] = React.useState(false);
  const [showWishlistToast, setShowWishlistToast] = React.useState(false);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(product);
      setShowToast(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Optionally show error toast
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.isAuthenticated || !auth.user?.id) {
      console.error('User not authenticated');
      return;
    }

    try {
      setWishlistLoading(true);
      const response = await fetch(
        `http://localhost:8090/order/wishlist/add?userId=${auth.user.id}&productId=${product.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add to wishlist: ${response.statusText}`);
      }

      setShowWishlistToast(true);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
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
            src={product.images?.[0]}
            alt={product.name}
            style={{ height: '200px', objectFit: 'cover' }}
          />
          
          {/* Wishlist Icon - Always visible for authenticated users */}
          {showWishlist && (
            <ProtectedComponent>
              <Button
                variant="light"
                className="position-absolute top-0 end-0 m-2 rounded-circle p-2"
                style={{ 
                  width: '36px', 
                  height: '36px',
                  zIndex: 10 // Ensure it's above the out of stock overlay
                }}
                onClick={handleAddToWishlist}
                disabled={wishlistLoading}
                title="Add to Wishlist"
              >
                {wishlistLoading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '16px' }}>❤️</span>

                )}
              </Button>
            </ProtectedComponent>
          )}
          
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

      {/* Cart Toast Notification */}
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

      {/* Wishlist Toast Notification */}
      <Toast
        onClose={() => setShowWishlistToast(false)}
        show={showWishlistToast}
        delay={3000}
        autohide
        style={{
          position: 'fixed',
          top: 80,
          right: 20,
          zIndex: 9999
        }}
      >
        <Toast.Header>
          <strong className="me-auto">Added to Wishlist!</strong>
          <small>just now</small>
        </Toast.Header>
        <Toast.Body>
          {product.name} has been added to your wishlist.
        </Toast.Body>
      </Toast>
    </>
  );
};

export default ProductCard;
