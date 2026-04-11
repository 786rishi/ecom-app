import React, { useState } from 'react';
import { Container, Button, Nav, NavDropdown, Badge } from 'react-bootstrap';
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
  onCategorySelect?: (category: string) => void;
  onAdvancedFilterClick?: () => void;
  onClearAdvancedFilters?: () => void;
  onSearch?: (query: string) => void;
  hasActiveFilters?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  viewMode,
  onViewModeChange,
  isGuestMode = false,
  onLogin,
  onNavigateHome,
  onCategorySelect,
  onAdvancedFilterClick,
  onClearAdvancedFilters,
  onSearch,
  hasActiveFilters = false
}) => {
  const { searchQuery, updateSearchQuery, clearFilters } = useProducts();

  const { cart } = useCart();
  const { auth, logout } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleSearch = (query: string) => {
    // Use enhanced search handler if provided, otherwise use hook's updateSearchQuery
    if (onSearch) {
      onSearch(query);
    } else {
      updateSearchQuery(query);
    }
  };

  const handleClearAll = () => {
    // If advanced filters are active, call the advanced filter clear function
    if (hasActiveFilters && onClearAdvancedFilters) {
      onClearAdvancedFilters();
    } else {
      // Otherwise, use the normal clear filters
      clearFilters();
    }
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

  const handleCategorySelect = (category: string) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
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
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            {/* Navigation Menu */}
            <div className="d-flex align-items-center gap-3">
              <Nav className="me-auto">
                <NavDropdown title="Women" id="women-nav-dropdown">
                  <div className="dropdown-menu-container" style={{ display: 'flex', minWidth: '600px', padding: '10px' }}>
                    {/* Column 1: Indian & Western Wear */}
                    <div style={{ flex: 1, paddingRight: '20px', borderRight: '1px solid #ddd' }}>
                      <div className="dropdown-header fw-bold text-dark mb-2">Indian & Western Wear</div>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Kurtas & Suits')} className="text-dark">• Kurtas & Suits</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Kurtis & Tunics')} className="text-dark">• Kurtis & Tunics</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Leggings, Salwars & Churidars')} className="text-dark">• Leggings, Salwars & Churidars</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Skirts & Palazzos')} className="text-dark">• Skirts & Palazzos</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Sarees & Blouses')} className="text-dark">• Sarees & Blouses</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Dress Material')} className="text-dark">• Dress Material</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Lehenga Choli')} className="text-dark">• Lehenga Choli</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Dupattas & Shawls')} className="text-dark">• Dupattas & Shawls</NavDropdown.Item>
                    </div>
                    
                    {/* Column 2: Western Wear */}
                    <div style={{ flex: 1, paddingLeft: '20px', paddingRight: '20px', borderRight: '1px solid #ddd' }}>
                      <div className="dropdown-header fw-bold text-dark mb-2">Western Wear</div>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Dresses & Jumpsuits')} className="text-dark">• Dresses & Jumpsuits</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Tops, T-Shirts & Shirts')} className="text-dark">• Tops, T-Shirts & Shirts</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Jeans & Jeggings')} className="text-dark">• Jeans & Jeggings</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Trousers & Capris')} className="text-dark">• Trousers & Capris</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Shorts & Skirts')} className="text-dark">• Shorts & Skirts</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Shrugs')} className="text-dark">• Shrugs</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Sweaters & Sweatshirts')} className="text-dark">• Sweaters & Sweatshirts</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Jackets & Waistcoats')} className="text-dark">• Jackets & Waistcoats</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Coats & Blazers')} className="text-dark">• Coats & Blazers</NavDropdown.Item>
                    </div>
                    
                    {/* Column 3: Accessories */}
                    <div style={{ flex: 1, paddingLeft: '20px' }}>
                      <div className="dropdown-header fw-bold text-dark mb-2">Accessories</div>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Watches')} className="text-dark">• Women Watches</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Sunglasses')} className="text-dark">• Sunglasses</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Eye Glasses')} className="text-dark">• Eye Glasses</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Women Belt')} className="text-dark">• Belt</NavDropdown.Item>
                    </div>
                  </div>
                </NavDropdown>
                
                <NavDropdown title="Men" id="men-nav-dropdown">
                  <div className="dropdown-menu-container" style={{ display: 'flex', minWidth: '600px', padding: '10px' }}>
                    {/* Column 1: Clothing - First Half */}
                    <div style={{ flex: 1, paddingRight: '20px', borderRight: '1px solid #ddd' }}>
                      <div className="dropdown-header fw-bold text-dark mb-2">Clothing</div>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men T-Shirts')} className="text-dark">• T-Shirts</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Casual Shirts')} className="text-dark">• Casual Shirts</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Formal Shirts')} className="text-dark">• Formal Shirts</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Suits')} className="text-dark">• Suits</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Jeans')} className="text-dark">• Jeans</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Casual Trousers')} className="text-dark">• Casual Trousers</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Formal Trousers')} className="text-dark">• Formal Trousers</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Shorts')} className="text-dark">• Shorts</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Track Pants')} className="text-dark">• Track Pants</NavDropdown.Item>
                    </div>
                    
                    {/* Column 2: Clothing - Second Half */}
                    <div style={{ flex: 1, paddingLeft: '20px', paddingRight: '20px', borderRight: '1px solid #ddd' }}>
                      <div className="dropdown-header fw-bold text-dark mb-2">&nbsp;</div>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Sweaters & Sweatshirts')} className="text-dark">• Sweaters & Sweatshirts</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Jackets')} className="text-dark">• Jackets</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Blazers & Coats')} className="text-dark">• Blazers & Coats</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Sports & Active Wear')} className="text-dark">• Sports & Active Wear</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Indian & Festive Wear')} className="text-dark">• Indian & Festive Wear</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Innerwear & Sleepwear')} className="text-dark">• Innerwear & Sleepwear</NavDropdown.Item>
                    </div>
                    
                    {/* Column 3: Accessories */}
                    <div style={{ flex: 1, paddingLeft: '20px' }}>
                      <div className="dropdown-header fw-bold text-dark mb-2">ACCESSORIES</div>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Watches & Wearables')} className="text-dark">• Watches & Wearables</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Sunglasses & Frames')} className="text-dark">• Sunglasses & Frames</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Bags & Backpacks')} className="text-dark">• Bags & Backpacks</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Luggage & Trolleys')} className="text-dark">• Luggage & Trolleys</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Personal Care & Grooming')} className="text-dark">• Personal Care & Grooming</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Wallets & Belts')} className="text-dark">• Wallets & Belts</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleCategorySelect('Men Fashion Accessories')} className="text-dark">• Fashion Accessories</NavDropdown.Item>
                    </div>
                  </div>
                </NavDropdown>
              </Nav>
            </div>

            {/* Right side controls */}
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

            {/* Advanced Filter */}
            <Button
              variant="outline-primary"
              size="sm"
              onClick={onAdvancedFilterClick}
              title="Advanced filters"
              className="d-flex align-items-center"
            >
              <span className="me-1">Advanced Filter</span>
              {hasActiveFilters && (
                <Badge bg="danger" className="ms-1" style={{ fontSize: '0.6em' }}>
                  Active
                </Badge>
              )}
            </Button>

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
