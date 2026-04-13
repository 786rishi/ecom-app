import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface Order {
  id: number;
  userId: string;
  totalAmount: number;
  status: string;
  paymentId: string | null;
  createdAt: string;
}

const OrderHistory: React.FC = () => {
  const { auth } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [returningOrderId, setReturningOrderId] = useState<number | null>(null);

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
      
      {/* Orders Table */}
      {orders.length === 0 ? (
        <Alert variant="info">
          No orders found. Start shopping to see your order history here!
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Payment ID</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>
                  <span className={`badge ${
                    order.status === 'PAID' ? 'bg-success' : 
                    order.status === 'PAYMENT_PENDING' ? 'bg-warning' : 
                    order.status === 'RETURNED' ? 'bg-danger' :
                    'bg-secondary'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.paymentId || 'N/A'}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
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
                  {!isWithinLast7Days(order.createdAt) && (
                    <small className="text-muted d-block mt-1">
                      Returns not available after 7 days
                    </small>
                  )}
                  {order.status === 'RETURNED' && (
                    <small className="text-muted d-block mt-1">
                      Order has been returned
                    </small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OrderHistory;
