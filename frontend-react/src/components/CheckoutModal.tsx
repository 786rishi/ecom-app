import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService, Promotion } from '../services/orderService';

interface CheckoutModalProps {
  show: boolean;
  onHide: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ show, onHide }) => {
  const { cart, clearCart } = useCart();
  const { auth } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [promotionCode, setPromotionCode] = useState('');
  const [originalAmount, setOriginalAmount] = useState<number | null>(null);
  const [discount, setDiscount] = useState<number | null>(null);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [baseCartTotal, setBaseCartTotal] = useState<number | null>(null);
  const [appliedPromotions, setAppliedPromotions] = useState<string[]>([]);
  const [autoAppliedPromotions, setAutoAppliedPromotions] = useState<Promotion[]>([]);
  const [promotionApplied, setPromotionApplied] = useState(false);
  const [manualPromotionApplied, setManualPromotionApplied] = useState(false);
  const [promotionError, setPromotionError] = useState('');
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expDate: '',
    cvv: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Auto-apply active PERCENTAGE promotions on component mount
  useEffect(() => {
    if (show && auth.isAuthenticated && auth.user?.id && cart.items.length > 0) {
      applyAutoPromotions();
    }
  }, [show, auth.isAuthenticated, auth.user?.id, cart.items]);

  const applyAutoPromotions = async () => {
    if (!auth.isAuthenticated || !auth.user?.id) return;

    setIsLoadingPromotions(true);
    setPromotionError('');

    try {
      // Fetch all promotions
      const promotionsResponse = await orderService.getPromotions();
      
      if (!promotionsResponse.success) {
        console.error('Failed to fetch promotions:', promotionsResponse.message);
        return;
      }

      // Filter active PERCENTAGE promotions
      const activePercentagePromotions = promotionsResponse.promotions.filter(
        promo => promo.active && promo.type === 'PERCENTAGE' && promo.couponCode == null && cart.total >= promo.minOrderAmount
      );

      if (activePercentagePromotions.length === 0) {
        return;
      }

      // Set the base cart total once
      setBaseCartTotal(cart.total);

      // Apply each active percentage promotion
      for (const promotion of activePercentagePromotions) {
        const result = await orderService.applyPromotion(
          auth.user.id,
          cart.total,
          cart.items
        );

        if (result.success) {
          setOriginalAmount(cart.total); // Keep original cart total as subtotal
          setDiscount(result.discount || 0);
          setFinalAmount(result.finalAmount || cart.total);
          setAppliedPromotions(result.appliedPromotions || []);
          setPromotionApplied(true);
          setAutoAppliedPromotions(prev => [...prev, promotion]);
        }
      }
    } catch (error) {
      console.error('Error applying auto promotions:', error);
      setPromotionError('Failed to apply automatic promotions');
    } finally {
      setIsLoadingPromotions(false);
    }
  };

  const handlePromotionApply = async () => {
    if (!promotionCode.trim()) {
      setPromotionError('Please enter a promotion code');
      return;
    }

    if (!auth.isAuthenticated || !auth.user?.id) {
      setPromotionError('User must be authenticated to apply promotions');
      return;
    }

    setIsProcessing(true);
    setPromotionError('');

    try {
      const originalCartTotal = baseCartTotal !== null ? baseCartTotal : cart.total;
      
      const result = await orderService.applyPromotion(
        auth.user.id,
        originalCartTotal,
        cart.items,
        promotionCode
      );

      if (result.success) {
        setOriginalAmount(originalCartTotal); // Keep original cart total as subtotal
        setDiscount(result.discount || 0);
        setFinalAmount(result.finalAmount || originalCartTotal);
        setAppliedPromotions(result.appliedPromotions || []);
        setPromotionApplied(true);
        setManualPromotionApplied(true);
        setPromotionCode(''); // Clear the input after successful application
        setPromotionError('');
      } else {
        setPromotionError(result.message || 'Failed to apply promotion');
      }
    } catch (error) {
      setPromotionError('Error applying promotion');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentTotal = () => {
    return finalAmount !== null ? finalAmount : cart.total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.isAuthenticated || !auth.user?.id) {
      alert('User must be authenticated to checkout');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Checkout
      const checkoutResult = await orderService.checkout(auth.user.id);
      
      if (!checkoutResult.success) {
        throw new Error(checkoutResult.message || 'Checkout failed');
      }

      // Handle both string and number order ID formats
      const orderId = checkoutResult.orderId || checkoutResult.id?.toString();
      
      if (!orderId) {
        console.error('Checkout response structure:', JSON.stringify(checkoutResult, null, 2));
        throw new Error('No order ID returned from checkout');
      }

      // Step 2: Payment
      const paymentResult = await orderService.makePayment(orderId, auth.user.id);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Payment failed');
      }

      // Step 3: Confirm inventory for each item
      const inventoryPromises = cart.items.map(item => 
        orderService.confirmInventory(item.product.id, item.quantity)
      );

      try {
        await Promise.all(inventoryPromises);
        // console.log('All inventory confirmations completed successfully');
      } catch (error) {
        console.error('Inventory confirmation failed:', error);
        // Continue with order even if inventory confirmation fails
      }

      // Order successful
      setOrderComplete(true);
      
      // Clear cart after successful order
      setTimeout(() => {
        clearCart();
        handleClose();
      }, 3000);
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setOrderComplete(false);
    setPromotionCode('');
    setOriginalAmount(null);
    setDiscount(null);
    setFinalAmount(null);
    setBaseCartTotal(null);
    setAppliedPromotions([]);
    setAutoAppliedPromotions([]);
    setPromotionApplied(false);
    setManualPromotionApplied(false);
    setPromotionError('');
    setIsLoadingPromotions(false);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      zipCode: '',
      cardNumber: '',
      expDate: '',
      cvv: ''
    });
    onHide();
  };

  if (orderComplete) {
    return (
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Order Complete! 🎉</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <div style={{ fontSize: '3rem' }}>✅</div>
          </div>
          <h4 className="text-success">Thank you for your order!</h4>
          <p className="text-muted">
            Your order has been successfully processed and will be delivered soon.
          </p>
          <p className="small text-muted">
            Order total: <strong>${getCurrentTotal().toFixed(2)}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Continue Shopping
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Checkout</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cart.items.length === 0 ? (
          <Alert variant="info">
            Your cart is empty. Add some products before checkout.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <h5 className="mb-3">Order Summary</h5>
                <div className="order-summary mb-4">
                  {cart.items.map((item: CartItem) => (
                    <div key={item.product.id} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <div className="fw-semibold">{item.product.name}</div>
                        <small className="text-muted">Qty: {item.quantity}</small>
                      </div>
                      <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <hr />
                  
                  {/* Promotion Code Section */}
                  <div className="mb-3">
                    {isLoadingPromotions && (
                      <Alert variant="info" className="small mb-2">
                        Applying automatic promotions...
                      </Alert>
                    )}
                    
                    {autoAppliedPromotions.length > 0 && (
                      <div className="mb-2">
                        <small className="text-muted fw-semibold">Auto-applied Promotions:</small>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {autoAppliedPromotions.map((promo, index) => (
                            <Badge key={index} bg="success" className="small">
                              {promo.name} ({promo.discountValue}% off)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-semibold">Additional Promo Code</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="text"
                          placeholder="Enter promo code"
                          value={promotionCode}
                          onChange={(e) => setPromotionCode(e.target.value)}
                          disabled={isProcessing}
                          size="sm"
                        />
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handlePromotionApply}
                          disabled={isProcessing || !promotionCode.trim()}
                        >
                          {isProcessing ? 'Applying...' : 'Apply'}
                        </Button>
                      </div>
                      {promotionError && (
                        <Form.Text className="text-danger small">
                          {promotionError}
                        </Form.Text>
                      )}
                      {manualPromotionApplied && discount !== null && discount > 0 && (
                        <Form.Text className="text-success small">
                          Additional promotion applied! You saved ${discount.toFixed(2)}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </div>
                  
                  {promotionApplied && originalAmount !== null ? (
                    <>
                      <div className="d-flex justify-content-between">
                        <span>Subtotal:</span>
                        <span>${originalAmount.toFixed(2)}</span>
                      </div>
                      {discount !== null && discount > 0 && (
                        <div className="d-flex justify-content-between text-success">
                          <span>Discount:</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      {appliedPromotions.length > 0 && (
                        <div className="mb-2">
                          <small className="text-muted">Applied Promotions:</small>
                          <div className="d-flex flex-wrap gap-1">
                            {appliedPromotions.map((promo, index) => (
                              <Badge key={index} bg="info" className="small">
                                {promo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total:</span>
                        <span>${getCurrentTotal().toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between">
                        <span>Subtotal:</span>
                        <span>${cart.total.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total:</span>
                        <span>${getCurrentTotal().toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </Col>
              
              <Col md={6}>
                <h5 className="mb-3">Payment Information</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your@email.com"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Zip Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h6 className="mt-4 mb-3">Card Details</h6>
                
                <Form.Group className="mb-3">
                  <Form.Label>Card Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="1234 5678 9012 3456"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expiry Date</Form.Label>
                      <Form.Control
                        type="text"
                        name="expDate"
                        value={formData.expDate}
                        onChange={handleInputChange}
                        required
                        placeholder="MM/YY"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVV</Form.Label>
                      <Form.Control
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required
                        placeholder="123"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Alert variant="info" className="small">
                  <strong>Demo Mode:</strong> This is a demo checkout. No actual payment will be processed.
                </Alert>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={handleClose} className="me-2">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay $${getCurrentTotal().toFixed(2)}`}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CheckoutModal;
