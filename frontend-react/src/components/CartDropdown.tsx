import React from 'react';
import { Dropdown, Button, Badge } from 'react-bootstrap';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../contexts/CartContext';

interface CartDropdownProps {
  onCheckout?: () => void;
}

const CartDropdown: React.FC<CartDropdownProps> = ({ onCheckout }) => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleClearCart = async () => {
    await clearCart();
  };


  if (cart.items.length === 0) {
    return (
      <Dropdown align="end">
        <Dropdown.Toggle variant="outline-primary" size="sm" disabled>
          🛒 Cart (0)
        </Dropdown.Toggle>
        <Dropdown.Menu style={{ minWidth: '300px' }}>
          <Dropdown.Item disabled>
            Your cart is empty
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="outline-primary" size="sm" className="position-relative">
        🛒 Cart (${cart.total.toFixed(2)})
        <Badge 
          bg="danger" 
          className="position-absolute top-0 start-100 translate-middle"
          style={{ fontSize: '0.6em', padding: '2px 6px' }}
        >
          {cart.itemCount}
        </Badge>
      </Dropdown.Toggle>
      
      <Dropdown.Menu style={{ minWidth: '350px', maxHeight: '400px', overflowY: 'auto' }}>
        <div className="p-3">
          <h6 className="mb-3">Cart Items ({cart.itemCount})</h6>
          
          {cart.items.map((item: CartItem) => (
            <div key={item.product.id} className="mb-3 pb-3 border-bottom">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="fw-semibold">{item.product.name}</div>
                  <div className="text-muted small">${item.product.price.toFixed(2)} each</div>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveItem(item.product.id)}
                  className="ms-2"
                >
                  ×
                </Button>
              </div>
              
              <div className="d-flex align-items-center mt-2">
                <span className="me-2">Qty:</span>
                <div className="btn-group btn-group-sm" role="group">
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                  <Button variant="outline-secondary" disabled>
                    {item.quantity}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <span className="ms-auto fw-bold">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-bold">Total:</span>
              <span className="fw-bold text-primary">${cart.total.toFixed(2)}</span>
            </div>
            
            <div className="d-grid gap-2">
              <Button variant="primary" size="sm" onClick={onCheckout}>
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={handleClearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CartDropdown;
