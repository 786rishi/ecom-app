import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import ProtectedComponent from './ProtectedComponent';
import ProductCard from './ProductCard';
import TestimonialsList from './TestimonialsList';
import TestimonialForm from './TestimonialForm';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onProductClick: (product: Product) => void;
  isAuthenticated: boolean;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onBack,
  onProductClick,
  isAuthenticated
}) => {
  const { addToCart } = useCart();
  const { auth } = useAuth();
  
  const [showToast, setShowToast] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [refreshTestimonials, setRefreshTestimonials] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedProductsLoading, setRelatedProductsLoading] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setShowToast(true);
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageZoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Limit panning to prevent image from going too far out of bounds
      const maxPan = (imageZoom - 1) * 200; // Adjust this value based on container size
      const limitedX = Math.max(-maxPan, Math.min(maxPan, newX));
      const limitedY = Math.max(-maxPan, Math.min(maxPan, newY));
      
      setImagePosition({ x: limitedX, y: limitedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Fetch related products when component mounts
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setRelatedProductsLoading(true);
      try {
        const response = await orderService.getRelatedProducts(product.id);
        if (response.success) {
          setRelatedProducts(response.products);
        } else {
          console.error('Failed to fetch related products:', response.message);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setRelatedProductsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product.id]);

  const currentImage = product.image;

  return (
    <>
      <Container fluid className="py-4">
        <Button variant="outline-secondary" onClick={onBack} className="mb-4">
          ← Back to Products
        </Button>

        <Row>
          {/* Product Images Section */}
          <Col lg={7} md={6}>
            <div className="product-image-section">
              {/* Main Image with Zoom */}
              <div className="main-image-container mb-3 border rounded p-3 bg-light">
                <div 
                  className="overflow-hidden d-flex justify-content-center align-items-center"
                  style={{ height: '500px', position: 'relative' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="img-fluid"
                    style={{
                      transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                      transition: isDragging ? 'none' : 'transform 0.3s ease',
                      maxHeight: '100%',
                      maxWidth: '100%',
                      cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                      userSelect: 'none'
                    }}
                    draggable={false}
                  />
                </div>
                
                {/* Zoom Controls */}
                <div className="zoom-controls d-flex gap-2 justify-content-center mt-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={imageZoom <= 0.5}
                  >
                    🔍 Zoom Out
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleResetZoom}
                  >
                    Reset
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={imageZoom >= 3}
                  >
                    🔍 Zoom In
                  </Button>
                </div>
              </div>

            </div>
          </Col>

          {/* Product Details Section */}
          <Col lg={5} md={6}>
            <div className="product-details-section">
              <h1 className="h2 mb-3">{product.name}</h1>
              
              {/* Price and Rating */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className="h3 text-primary mb-0">${product.price.toFixed(2)}</span>
                {product.rating && (
                  <div className="d-flex align-items-center">
                    <div className="text-warning me-1">
                      {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <small className="text-muted">({product.reviews || 0} reviews)</small>
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-3">
                {product.inStock ? (
                  <Badge bg="success" className="fs-6">In Stock</Badge>
                ) : (
                  <Badge bg="danger" className="fs-6">Out of Stock</Badge>
                )}
                {product.availableQuantity && (
                  <span className="text-muted ms-2">
                    ({product.availableQuantity} available)
                  </span>
                )}
              </div>

              {/* Category and Brand */}
              <div className="mb-3">
                <Badge bg="light" text="dark" className="me-2">
                  {product.category}
                </Badge>
                <Badge bg="secondary" text="light">
                  {product.brand}
                </Badge>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h5>Description</h5>
                <p className="text-muted">{product.description}</p>
              </div>

              {/* Product Attributes */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="mb-4">
                  <h5>Product Details</h5>
                  <div className="attributes-list">
                    {product.attributes.map((attribute, index) => (
                      <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted capitalize">{attribute.name}:</span>
                        <span className="fw-medium">{attribute.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="mb-4">
                <ProtectedComponent>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100"
                    disabled={!product.inStock}
                    onClick={handleAddToCart}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </ProtectedComponent>
                {!isAuthenticated && (
                  <Alert variant="info" className="mt-3">
                    Please <strong>login</strong> to add items to your cart.
                  </Alert>
                )}
              </div>

              {/* Additional Info */}
              <div className="text-muted small mb-4">
                <p className="mb-1">
                  <strong>Product ID:</strong> {product.id}
                </p>
                <p className="mb-1">
                  <strong>Added:</strong> {new Date(product.createdAt).toLocaleDateString()}
                </p>
                {product.updatedAt !== product.createdAt && (
                  <p className="mb-1">
                    <strong>Last Updated:</strong> {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Related Products Section */}
              <div className="related-products-section mt-4 pt-3 border-top">
                <h5 className="mb-3">Related Products</h5>
                {relatedProductsLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading related products...</span>
                    </Spinner>
                  </div>
                ) : relatedProducts.length > 0 ? (
                  <div className="related-products-scroll" style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#c1c1c1 #f1f1f1'
                  }}>
                    {relatedProducts.map((relatedProduct) => (
                      <div key={relatedProduct.id} style={{ 
                        minWidth: '250px', 
                        maxWidth: '250px',
                        flexShrink: 0
                      }}>
                        <ProductCard
                          product={relatedProduct}
                          onProductClick={onProductClick}
                          showAddToCart={true}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted text-center py-3">
                    <small>No related products found</small>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Testimonials Section */}
      <TestimonialsList productId={product.id} refreshTrigger={refreshTestimonials} />

      {/* Testimonial Form Section */}
      {auth && auth.user && (
        <TestimonialForm
          productId={product.id}
          userId={auth.user.id}
          userName={auth.user.name || auth.user.preferredUsername || 'Anonymous'}
          isAuthenticated={isAuthenticated}
          onSubmitSuccess={() => setRefreshTestimonials(!refreshTestimonials)}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999
          }}
        >
          <Alert
            variant="success"
            onClose={() => setShowToast(false)}
            dismissible
          >
            <Alert.Heading>Added to Cart!</Alert.Heading>
            <p>{product.name} has been added to your cart.</p>
          </Alert>
        </div>
      )}
    </>
  );
};

export default ProductDetails;
