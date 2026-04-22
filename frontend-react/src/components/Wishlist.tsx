import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Toast, Image } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Product, ProductAttribute } from '../types/product';
import Footer from './Footer';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface WishlistResponse {
  userId: string;
  products: Product[];
}

interface WishlistProps {
  setAppState?: (state: any) => void;
}

interface WishlistProduct extends Product {
  // Keep the original ProductAttribute[] but we'll handle API conversion
}

const Wishlist: React.FC<WishlistProps> = ({ setAppState }) => {
  const { auth } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [addToCartLoading, setAddToCartLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    if (!auth.isAuthenticated || !auth.user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/order/wishlist/${auth.user.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wishlist: ${response.statusText}`);
      }

      const data: WishlistResponse = await response.json();
      // Convert API response to match Product interface
      const convertedProducts = (data.products || []).map((product: any): WishlistProduct => {
        // Convert API attributes (object format) to ProductAttribute[] format
        let convertedAttributes: ProductAttribute[] = [];
        if (product.attributes && typeof product.attributes === 'object') {
          if (Array.isArray(product.attributes)) {
            convertedAttributes = product.attributes;
          } else {
            // Convert object to ProductAttribute array
            convertedAttributes = Object.entries(product.attributes).map(([key, value]) => ({
              name: key,
              value: String(value),
              type: key === 'size' ? 'size' : key === 'color' ? 'color' : 'other' as const
            }));
          }
        }
        
        return {
          ...product,
          attributes: convertedAttributes,
          brand: product.brand || 'Unknown',
          image: product.image || '/placeholder-image.jpg'
        };
      });
      setWishlistItems(convertedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: WishlistProduct) => {
    if (!auth.isAuthenticated || !auth.user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      setAddToCartLoading(product.id);
      
      // Add to cart using existing cart functionality
      await addToCart(product);
      
      // Remove from wishlist after successful cart addition
      await removeFromWishlist(product.id);
      
      setToastMessage(`${product.name} added to cart and removed from wishlist`);
      setShowToast(true);
      
      // Refresh wishlist
      await fetchWishlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product to cart');
    } finally {
      setAddToCartLoading(null);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!auth.isAuthenticated || !auth.user?.id) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/order/wishlist/remove?userId=${auth.user.id}&productId=${productId}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to remove from wishlist: ${response.statusText}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getAttributeValue = (attributes: any, key: string) => {
    if (Array.isArray(attributes)) {
      const attr = attributes.find((a: ProductAttribute) => a.name === key);
      return attr ? attr.value : 'N/A';
    }
    return attributes[key] || 'N/A';
  };

  const handleBrowseProducts = () => {
    setAppState?.('browse');
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading wishlist...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchWishlist}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Wishlist</h2>
          <span className="text-muted">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {wishlistItems.length === 0 ? (
          <Alert variant="info">
            <Alert.Heading>Your wishlist is empty</Alert.Heading>
            <p>Browse our products and add items to your wishlist to see them here.</p>
            <Button variant="primary" onClick={handleBrowseProducts}>
              Browse Products
            </Button>
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover className="wishlist-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>Stock Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <Image
                        src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={product.name}
                        rounded
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover'
                        }}
                      />
                    </td>
                    <td className="fw-semibold">{product.name}</td>
                    <td>
                      <div style={{ maxWidth: '200px' }}>
                        {product.description.length > 50
                          ? `${product.description.substring(0, 50)}...`
                          : product.description
                        }
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{product.category}</span>
                    </td>
                    <td className="fw-bold text-primary">{formatPrice(product.price)}</td>
                    <td>{getAttributeValue(product.attributes, 'color')}</td>
                    <td>{getAttributeValue(product.attributes, 'size')}</td>
                    <td>
                      {product.inStock ? (
                        <span className="badge bg-success">In Stock</span>
                      ) : (
                        <span className="badge bg-danger">Out of Stock</span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!product.inStock || addToCartLoading === product.id}
                        onClick={() => handleAddToCart(product)}
                      >
                        {addToCartLoading === product.id ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Adding...
                          </>
                        ) : product.inStock ? (
                          'Add to Cart'
                        ) : (
                          'Out of Stock'
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Container>

      {/* Success Toast */}
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
          <strong className="me-auto">Success!</strong>
          <small>just now</small>
        </Toast.Header>
        <Toast.Body>
          {toastMessage}
        </Toast.Body>
      </Toast>

    </>
  );
};

export default Wishlist;
