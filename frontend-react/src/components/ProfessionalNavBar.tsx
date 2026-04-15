import React, { useState } from 'react';
import { Nav, Navbar, Container, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import './ProfessionalNavBar.css';

const KEYCLOAK_BASE_URL = process.env.REACT_APP_KEYCLOAK_BASE_URL || 'http://localhost:8080';
const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

interface ProfessionalNavBarProps {
  onNavigateHome?: () => void;
  isGuestMode?: boolean;
  setAppState?: (state: 'main' | 'browse' | 'add-product' | 'inventory-management') => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  action?: () => void;
  requireAuth?: boolean;
}

const ProfessionalNavBar: React.FC<ProfessionalNavBarProps> = ({
  onNavigateHome,
  isGuestMode = false,
  setAppState
}) => {
  const { auth, logout } = useAuth();

  const [expanded, setExpanded] = useState(false);

  const handleNavClick = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    if (action) {
      action();
    }
    setExpanded(false);
  };

  const navItems: NavItem[] = [
    {
      name: 'Home',
      href: '#home',
      action: () => setAppState?.('main'),
      icon: '🏠'
    },
    {
      name: 'Products',
      href: '#products',
      action: () => setAppState?.('browse'),
      icon: '📦'
    },
    {
      name: 'About',
      href: '#about',
      icon: 'ℹ️'
    },
    {
      name: 'Orders',
      href: '#OrderHistory',
      icon: '',
      action: () => {
        window.location.hash = 'OrderHistory';
      },
      requireAuth: true
    },
    {
      name: 'Wishlist',
      href: '#wishlist',
      icon: '❤️',
      action: () => {
        window.location.hash = 'wishlist';
      },
      requireAuth: true
    },
    {
      name: 'Contact',
      href: '#contact',
      icon: '📞',
      action: () => {
        window.location.hash = 'contact';
      }
    }
  ];

  const adminNavItems = [
    {
      name: 'Add Product',
      href: '#product',
      icon: '➕',
      action: () => {
        window.location.hash = 'product';
      }
    },
    {
      name: 'Inventory',
      href: '#Inventory',
      icon: '📊',
      action: () => {
        window.location.hash = 'Inventory';
      }
    },
    {
      name: 'Promotions',
      href: '#promotions',
      icon: '🎁',
      action: () => {
        window.location.hash = 'promotions';
      }
    }
  ];

  return (
    <Navbar
      expand="lg"
      className="professional-navbar shadow-lg"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Navbar.Brand
          href="/"
          className="brand-logo fw-bold"
          onClick={(e) => handleNavClick(e, onNavigateHome)}
        >
          <span className="brand-icon">🛍️</span>
          <span className="brand-text">MCart Store</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="professional-nav"
          className="custom-toggle"
        />

        <Navbar.Collapse id="professional-nav">
          <Nav className="mx-auto main-nav">
            {navItems.map((item, index) => {
              // Skip items that require authentication if user is not authenticated
              if (item.requireAuth && !auth.isAuthenticated) {
                return null;
              }
              return (
                <Nav.Link
                  key={index}
                  href={item.href}
                  className="nav-item-custom"
                  onClick={(e) => handleNavClick(e, item.action)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                </Nav.Link>
              );
            })}


            {auth.isAuthenticated && auth.user?.roles?.includes('admin') && (
              <Dropdown as={Nav.Item} className="admin-dropdown">
                <Dropdown.Toggle
                  as={Nav.Link}
                  className="nav-item-custom admin-toggle"
                >
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-text">Admin</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="admin-menu">
                  {adminNavItems.map((item, index) => (
                    <Dropdown.Item
                      key={index}
                      href={item.href}
                      className="admin-menu-item"
                      onClick={(e) => handleNavClick(e, item.action)}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      {item.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>

          <Nav className="user-nav">
            {auth.isAuthenticated ? (
              <div className="user-info">
                <span className="welcome-text">
                  Welcome, <strong>{auth.user?.name}</strong>
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  className="logout-btn"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="login-btn"
                onClick={() => window.open(`${KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/auth?client_id=fb-login&redirect_uri=${REACT_APP_BASE_URL}&state=f7d4b3fd-5ec0-4f51-ac5f-273aeeba1696&response_mode=query&response_type=code&scope=openid&nonce=81ad7d0a-b7ed-4705-8f73-ed4682143379&code_challenge=Z57CRwqdPDpdWKKqnyL8OxnqO0JGV1R3pTjB55qiKMQ&code_challenge_method=S256`, '_self')}
              >
                Login/Register
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ProfessionalNavBar;
