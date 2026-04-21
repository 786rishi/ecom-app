import React, { useState, useEffect } from 'react';
import { Carousel, Container, Row, Col, Card, Badge, Button, Toast } from 'react-bootstrap';
import { productService, ProductResponse } from '../services/productService';
import { Product } from '../types/product';
import LoadingSpinner from './LoadingSpinner';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProtectedComponent from './ProtectedComponent';
import AdminProtectedComponent from './AdminProtectedComponent';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface FeaturedProductsCarouselProps {
  onProductClick?: (product: Product) => void;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  onProductDelete?: (productId: string) => void;
  className?: string;
}

const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({
  onProductClick,
  showAddToCart = false,
  showWishlist = false,
  onProductDelete,
  className = ''
}) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { auth } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [toastProduct, setToastProduct] = useState<Product | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const enableProductDelete = process.env.REACT_APP_ENABLE_PRODUCT_DELETE === 'true';

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response: ProductResponse = await productService.searchProducts('featured', 0, 50);
        setFeaturedProducts(response.content || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

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

  const handleAddToWishlist = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!auth.isAuthenticated || !auth.user?.id) {
      console.error('User not authenticated');
      return;
    }

    try {
      setWishlistLoading(product.id);
      const response = await fetch(
        `${API_BASE_URL}/order/wishlist/add?userId=${auth.user.id}&productId=${product.id}`,
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

      setToastProduct(product);
      setShowWishlistToast(true);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    } finally {
      setWishlistLoading(null);
    }
  };

  const handleDeleteProduct = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!product.id) return;

    try {
      setDeleteLoading(product.id);
      await productService.deleteProduct(product.id);
      
      // Show success toast notification
      setShowDeleteToast(true);
      
      // Remove the deleted product from featured products
      setFeaturedProducts(prev => prev.filter(p => p.id !== product.id));
      
      // Notify parent component to remove the product from UI
      if (onProductDelete) {
        onProductDelete(product.id);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      // Show error toast notification
      setShowDeleteToast(true);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <Container fluid className={`py-4 ${className}`}>
        <div className="text-center">
          <LoadingSpinner text="Loading featured products..." size="lg" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className={`py-4 ${className}`}>
        <div className="alert alert-warning text-center">
          {error}
        </div>
      </Container>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  // Group products into sets of 3 for each carousel slide to ensure multiple slides
  const productGroups = [];
  for (let i = 0; i < featuredProducts.length; i += 3) {
    productGroups.push(featuredProducts.slice(i, i + 3));
  }

  return (
    <Container fluid className={`py-4 ${className}`}>
      <div className="mb-4">
        {/* <h2 className="text-center mb-4">
          <Badge bg="warning" text="dark" className="px-3 py-2">
            ⭐ Featured Products
          </Badge>
        </h2> */}
        
        <Carousel 
          indicators={productGroups.length > 1}
          controls={productGroups.length > 1}
          interval={2000}
          pause="hover"
          className="featured-products-carousel"
        >
          {productGroups.map((group, groupIndex) => (
            <Carousel.Item key={groupIndex}>
              <Row>
                {group.map((product) => (
                  <Col key={product.id} xs={12} sm={6} md={4} className="mb-3">
                    <Card
                      className="h-100 featured-product-card"
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="position-relative">
                        <Card.Img
                          variant="top"
                          src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={product.name}
                          style={{ height: '180px', objectFit: 'cover' }}
                        />
                        
                        {/* Delete Icon - Only visible to admin users when ENABLE_PRODUCT_DELETE is true */}
                        {enableProductDelete && (
                          <AdminProtectedComponent>
                            <Button
                              variant="danger"
                              className="position-absolute top-0 start-0 m-2 p-2"
                              style={{ 
                                width: 'auto', 
                                height: 'auto',
                                zIndex: 10,
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'black',
                                padding: '4px 8px'
                              }}
                              onClick={(e) => handleDeleteProduct(e, product)}
                              disabled={deleteLoading === product.id}
                              title="Delete Product"
                            >
                              {deleteLoading === product.id ? (
                                <div className="spinner-border spinner-border-sm" role="status" style={{ color: 'black' }}>
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              ) : (
                                <span style={{ fontSize: '18px', color: 'black' }}>×</span>
                              )}
                            </Button>
                          </AdminProtectedComponent>
                        )}

                        {/* Wishlist Icon */}
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
                              onClick={(e) => handleAddToWishlist(e, product)}
                              disabled={wishlistLoading === product.id}
                              title="Add to Wishlist"
                            >
                              {wishlistLoading === product.id ? (
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
                        <div className="position-absolute top-0 start-0 m-2">
                          <Badge bg="danger" className="featured-badge">
                            Featured
                          </Badge>
                        </div>
                      </div>

                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="fs-6 text-truncate" title={product.name}>
                          {product.name}
                        </Card.Title>

                        <Card.Text className="text-muted small flex-grow-1">
                          {product.description.length > 80
                            ? `${product.description.substring(0, 80)}...`
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
                            <div className="text-warning me-1 small">
                              {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
                            </div>
                            <small className="text-muted">({product.reviews || 0})</small>
                          </div>
                        )}

                        {showAddToCart && (
                          <ProtectedComponent>
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-100 mt-auto"
                              disabled={!product.inStock}
                              onClick={(e) => handleAddToCart(e, product)}
                            >
                              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                          </ProtectedComponent>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      <style>{`
        .featured-products-carousel .carousel-control-prev,
        .featured-products-carousel .carousel-control-next {
          width: 5%;
          background: rgba(0, 0, 0, 0.5);
        }
        
        .featured-product-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        
        .featured-product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .featured-badge {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>

      {/* Cart Toast Notification */}
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

      {/* Wishlist Toast Notification */}
      {toastProduct && (
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
            {toastProduct.name} has been added to your wishlist.
          </Toast.Body>
        </Toast>
      )}

      {/* Delete Toast Notification */}
      {showDeleteToast && (
        <Toast
          onClose={() => setShowDeleteToast(false)}
          show={showDeleteToast}
          delay={3000}
          autohide
          style={{
            position: 'fixed',
            top: '140px',
            right: '20px',
            zIndex: 9999
          }}
        >
          <Toast.Header>
            <strong className="me-auto">Product Deleted!</strong>
            <small>just now</small>
          </Toast.Header>
          <Toast.Body>
            Product has been deleted successfully.
          </Toast.Body>
        </Toast>
      )}
    </Container>
  );
};

export default FeaturedProductsCarousel;
