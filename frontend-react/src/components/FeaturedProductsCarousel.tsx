import React, { useState, useEffect } from 'react';
import { Carousel, Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { productService, ProductResponse } from '../services/productService';
import { Product } from '../types/product';
import LoadingSpinner from './LoadingSpinner';
import { useCart } from '../contexts/CartContext';
import ProtectedComponent from './ProtectedComponent';

interface FeaturedProductsCarouselProps {
  onProductClick?: (product: Product) => void;
  showAddToCart?: boolean;
  className?: string;
}

const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({
  onProductClick,
  showAddToCart = false,
  className = ''
}) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

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
                          src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={product.name}
                          style={{ height: '180px', objectFit: 'cover' }}
                        />
                        {!product.inStock && (
                          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
                            <Badge bg="secondary" className="fs-6">Out of Stock</Badge>
                          </div>
                        )}
                        <div className="position-absolute top-0 end-0 m-2">
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
                            <button
                              className="btn btn-primary btn-sm w-100 mt-auto"
                              disabled={!product.inStock}
                              onClick={(e) => handleAddToCart(e, product)}
                            >
                              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
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
    </Container>
  );
};

export default FeaturedProductsCarousel;
