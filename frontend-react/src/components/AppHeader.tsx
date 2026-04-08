import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import SearchInput from './SearchInput';
import CheckoutModal from './CheckoutModal';
import CartDropdown from './CartDropdown';
import LoginModal from './LoginModal';
import ProtectedComponent from './ProtectedComponent';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface AppHeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  isGuestMode?: boolean;
  onLogin?: () => void;
  onNavigateHome?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  viewMode,
  onViewModeChange,
  isGuestMode = false,
  onLogin,
  onNavigateHome
}) => {
  const { searchQuery, updateSearchQuery, clearFilters } = useProducts();

  const { cart } = useCart();
  const { auth, logout } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleSearch = (query: string) => {
    updateSearchQuery(query);
  };

  const handleClearAll = () => {
    clearFilters();
  };

  const handleCheckout = () => {
    if (cart.itemCount > 0) {
      setShowCheckout(true);
    }
  };

  const handleLogin = () => {
    setShowLogin(true);
  };

  const handleLogout = () => {
    logout();
    // Clear cart when logging out
    // This will be handled by the cart context if needed
  };

  // Listen for custom event to show login modal
  React.useEffect(() => {
    const handleShowLogin = () => setShowLogin(true);
    window.addEventListener('showLogin', handleShowLogin);
    return () => window.removeEventListener('showLogin', handleShowLogin);
  }, []);

  return (
    <>
      <div className="app-header bg-light shadow-sm mb-4 py-3">
        <Container className="d-flex justify-content-end align-items-center">
          <div className="d-flex align-items-center gap-3">
            {/* Search Input */}
            <div style={{ minWidth: '300px' }}>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search products..."
                size="sm"
              />
            </div>

            {/* Cart Dropdown - Hidden in guest mode */}
            {!isGuestMode && (
              <div>
                <ProtectedComponent>
                  <CartDropdown onCheckout={handleCheckout} />
                </ProtectedComponent>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="btn-group" role="group">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                title="Grid View"
              >
                ⊞
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                title="List View"
              >
                ☰
              </Button>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleClearAll}
              title="Clear all filters"
            >
              Clear Filters
            </Button>
          </div>
        </Container>
      </div>

      {/* Login Modal */}
      <LoginModal
        show={showLogin}
        onHide={() => setShowLogin(false)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        show={showCheckout}
        onHide={() => setShowCheckout(false)}
      />
    </>
  );
};

export default AppHeader;
