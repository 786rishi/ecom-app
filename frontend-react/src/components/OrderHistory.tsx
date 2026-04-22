import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  active: boolean;
  featured: boolean;
  featureStart: string;
  featureEnd: string;
  availableQuantity: number;
  inStock: boolean;
  attributes: {
    color: string;
    size: string;
  };
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: number;
  userId: string;
  totalAmount: number;
  discount: number;
  status: string;
  paymentId: string | null;
  createdAt: string;
  items: OrderItem[];
}

const OrderHistory: React.FC = () => {
  const { auth } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [returningOrderId, setReturningOrderId] = useState<number | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  // Fetch orders from API
  const fetchOrders = async () => {
    if (!auth.user?.id) {
      setError('User ID not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/order/orders/${auth.user.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }
      
      const data: Order[] = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Check if order is within last 7 days
  const isWithinLast7Days = (createdAt: string): boolean => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Handle return order
  const handleReturnOrder = async (orderId: number) => {
    if (!auth.user?.id) {
      setError('User ID not found');
      return;
    }

    try {
      setReturningOrderId(orderId);
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch(
        `${API_BASE_URL}/order/orders/${orderId}/return`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to return order: ${response.statusText}`);
      }
      
      setSuccessMessage('Order returned successfully!');
      
      // Refresh orders after successful return
      await fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return order');
    } finally {
      setReturningOrderId(null);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [auth.user?.id]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Toggle order expansion
  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Get fallback image
  const getFallbackImage = (image: string | null): string => {
    return image || 'https://acullen-portfolio.eddl.tru.ca/wp-content/themes/koji/assets/images/default-fallback-image.png';
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading order history...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Order History</h2>
      
      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      
      {/* Error Message */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Orders List */}
      {orders.length === 0 ? (
        <Alert variant="info">
          No orders found. Start shopping to see your order history here!
        </Alert>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Button
                    variant="link"
                    className="p-0 me-2 text-decoration-none"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    <span style={{ fontSize: '20px' }}>
                      {expandedOrders.has(order.id) ? '▲' : '▼'}
                    </span>
                  </Button>
                  <div>
                    <strong>Order #{order.id}</strong>
                    <div className="text-muted small">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="text-end">
                    <div className="fw-bold">{formatCurrency(order.totalAmount)}</div>
                    <span className={`badge ${
                      order.status === 'CONFIRMED' ? 'bg-success' : 
                      order.status === 'PAYMENT_PENDING' ? 'bg-warning' : 
                      order.status === 'RETURNED' ? 'bg-danger' :
                      'bg-secondary'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReturnOrder(order.id)}
                    disabled={!isWithinLast7Days(order.createdAt) || returningOrderId === order.id || order.status === 'RETURNED'}
                    style={{
                      opacity: isWithinLast7Days(order.createdAt) && order.status !== 'RETURNED' ? 1 : 0.5,
                      cursor: isWithinLast7Days(order.createdAt) && order.status !== 'RETURNED' ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {returningOrderId === order.id ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-1"
                        />
                        Returning...
                      </>
                    ) : (
                      order.status === 'RETURNED' ? 'Returned' : 'Return'
                    )}
                  </Button>
                </div>
              </Card.Header>
              
              {expandedOrders.has(order.id) && (
                <Card.Body>
                  <h6 className="mb-3">Order Items ({order.items.length})</h6>
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Details</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={getFallbackImage(item.product.image)}
                                alt={item.product.name}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                  marginRight: '12px'
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = 'https://acullen-portfolio.eddl.tru.ca/wp-content/themes/koji/assets/images/default-fallback-image.png';
                                }}
                              />
                              <div>
                                <div className="fw-semibold">{item.product.name}</div>
                                <div className="text-muted small">{item.product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="small">
                              <div>Color: <span className="text-capitalize">{item.product.attributes.color}</span></div>
                              <div>Size: {item.product.attributes.size}</div>
                            </div>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td className="fw-semibold">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      {order.discount && (
                        <tr>
                          <td colSpan={4} className="text-end">Discount:</td>
                          <td>-{formatCurrency(order.discount)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={4} className="text-end fw-bold">Order Total:</td>
                        <td className="fw-bold text-success">{formatCurrency(order.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </Table>
                  
                  <div className="mt-3 d-flex justify-content-between">
                    <div className="text-muted small">
                      Payment ID: {order.paymentId || 'N/A'}
                    </div>
                    {!isWithinLast7Days(order.createdAt) && (
                      <small className="text-muted">
                        Returns not available after 7 days
                      </small>
                    )}
                    {order.status === 'RETURNED' && (
                      <small className="text-muted">
                        Order has been returned
                      </small>
                    )}
                  </div>
                </Card.Body>
              )}
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default OrderHistory;
