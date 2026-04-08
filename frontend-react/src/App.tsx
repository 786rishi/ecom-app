import React, { useEffect, useState } from 'react';
import { Container, Alert } from 'react-bootstrap';
import AppHeader from './components/AppHeader';
import ProfessionalNavBar from './components/ProfessionalNavBar';
import ProductGrid from './components/ProductGrid';
import ProductList from './components/ProductList';
import PaginationComponent from './components/Pagination';
import LoadingSpinner from './components/LoadingSpinner';
import SearchResults from './components/SearchResults';
import LandingPage from './components/LandingPage';
import AddProduct from './components/AddProduct';
import InventoryManagement from './components/InventoryManagement';
import { useProducts, setStateChangeCallback } from './hooks/useProducts';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GuestModeProvider, useGuestMode } from './contexts/GuestModeContext';
import { Product } from './types/product';
import './App.css';

type AppState = 'main' | 'browse' | 'add-product' | 'inventory-management';

// Track previous render to compare
let lastRenderProducts: any = undefined;
let renderCounter = 0;

// MOVED OUTSIDE: AppContent must be defined outside of App to prevent recreation
function AppContent() {

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [appState, setAppState] = useState<AppState>('main');
  const [, setForceRender] = useState(0); // Component-level state to trigger re-renders
  const { isGuestMode, setIsGuestMode } = useGuestMode();
  const { auth } = useAuth();

  // Register callback to be called when hook state changes
  React.useEffect(() => {
    setStateChangeCallback(() => {
      setForceRender(prev => prev + 1);
    });
  }, []);

  const hookReturn = useProducts();
  const { products, allProducts, loading, error, searchQuery, pagination, updatePage, updatePageSize, clearFilters, stateVersion } = hookReturn;

  console.log("updated products::", hookReturn);


  // Check if products array reference changed
  const productsChanged = lastRenderProducts !== products;
  lastRenderProducts = products;

  // Keep track of last stateVersion to detect changes
  const lastStateVersionRef = React.useRef(stateVersion);

  // When hook's stateVersion changes, trigger re-render
  useEffect(() => {
    if (lastStateVersionRef.current !== stateVersion) {
      lastStateVersionRef.current = stateVersion;
    }
  }, [stateVersion, products?.length, searchQuery]);

  // Check if user is already authenticated and redirect to browse
  React.useEffect(() => {
    if (auth.isAuthenticated && appState === 'main') {
      setAppState('browse');
      setIsGuestMode(false);
    }
  }, [auth.isAuthenticated, appState, setAppState, setIsGuestMode]);

  const handleLogin = () => {
    window.open('http://localhost:8080/realms/master/protocol/openid-connect/auth?client_id=fb-login&redirect_uri=http%3A%2F%2Flocalhost%3A3000&state=f7d4b3fd-5ec0-4f51-ac5f-273aeeba1696&response_mode=query&response_type=code&scope=openid&nonce=81ad7d0a-b7ed-4705-8f73-ed4682143379&code_challenge=Z57CRwqdPDpdWKKqnyL8OxnqO0JGV1R3pTjB55qiKMQ&code_challenge_method=S256', '_self');
  };

  const handleBrowseAsGuest = () => {
    setIsGuestMode(true);
    setAppState('browse');
  };

  const handleAuthenticated = () => {
    setIsGuestMode(false);
    setAppState('browse');
  };

  const handleProductClick = (product: Product) => {
    alert(`Product clicked: ${product.name}\n\nThis would navigate to the product detail page.`);
  };

  const handleSearchClear = () => {
    clearFilters();
  };

  const handleSuggestionClick = (suggestion: string) => {
    // TODO: Implement suggestion click

  };

  const handleNavigateHome = () => {
    setAppState('main');
  };

  // Listen for login success event
  React.useEffect(() => {
    const handleLoginSuccess = () => {
      setIsGuestMode(false);
      setAppState('browse');

    };

    window.addEventListener('loginSuccess', handleLoginSuccess);
    return () => window.removeEventListener('loginSuccess', handleLoginSuccess);
  }, [setIsGuestMode, setAppState]);

  // Handle hash-based routing
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // Remove the #
      
      if (hash === 'product' && auth.isAuthenticated && auth.user?.roles?.includes('admin')) {
        setAppState('add-product');
      } else if (hash === 'Inventory' && auth.isAuthenticated && auth.user?.roles?.includes('admin')) {
        setAppState('inventory-management');
      } else if (hash === 'product' || hash === 'Inventory') {
        // Redirect non-admin users to browse
        setAppState('browse');
        window.location.hash = '';
      }
    };

    // Check hash on initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [auth.isAuthenticated, auth.user?.roles, setAppState]);

  useEffect(() => {
    // OAuth callback is handled by AuthContext automatically
    // This effect is just a safety check in case needed
  }, []);

  // Show landing page
  if (appState === 'main') {
    return (
      <LandingPage
        onLogin={handleLogin}
        onBrowseAsGuest={handleBrowseAsGuest}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  // Show add product page
  if (appState === 'add-product') {
    return (
      <div className="App">
        <ProfessionalNavBar
          isGuestMode={isGuestMode}
          onNavigateHome={handleNavigateHome}
        />
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isGuestMode={isGuestMode}
          onLogin={handleLogin}
          onNavigateHome={handleNavigateHome}
        />
        <AddProduct />
      </div>
    );
  }

  // Show inventory management page
  if (appState === 'inventory-management') {
    return (
      <div className="App">
        <ProfessionalNavBar
          isGuestMode={isGuestMode}
          onNavigateHome={handleNavigateHome}
        />
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isGuestMode={isGuestMode}
          onLogin={handleLogin}
          onNavigateHome={handleNavigateHome}
        />
        <InventoryManagement />
      </div>
    );
  }

  // Show products page
  if (appState === 'browse') {
    const hasProducts = products && Array.isArray(products) && products.length > 0;
    const isLoading = loading;

    return (
      <div className="App">
        <ProfessionalNavBar
          isGuestMode={isGuestMode}
          onNavigateHome={handleNavigateHome}
        />
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isGuestMode={isGuestMode}
          onLogin={handleLogin}
          onNavigateHome={handleNavigateHome}
        />

        <Container fluid className="py-4">
          {/* DEBUG: Show products count visually */}
          <div style={{
            position: 'fixed',
            top: 60,
            right: 20,
            padding: '10px 15px',
            backgroundColor: '#fff3cd',
            border: '2px solid #ff6b6b',
            borderRadius: '5px',
            zIndex: 9999,
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            🔍 PRODUCTS: {products?.length || 0} | SEARCH: '{searchQuery}' | LOADING: {loading ? 'YES' : 'NO'}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          {/* Search Results Header */}
          {/* <SearchResults
            products={products}
            allProducts={allProducts}
            query={searchQuery}
            loading={loading}
            onClearSearch={handleSearchClear}
            onSuggestionClick={handleSuggestionClick}
            className="mb-4"
          /> */}

          {/* Loading Spinner - only show if no products loaded yet */}
          {isLoading && !hasProducts && (
            <LoadingSpinner
              text="Loading products..."
              centered
              size="lg"
            />
          )}

          {/* Products Display - show if products exist, regardless of loading state */}
          {hasProducts && (
            <>
              {viewMode === 'grid' ? (
                <ProductGrid
                  products={products}
                  onProductClick={handleProductClick}
                  showAddToCart={auth.isAuthenticated}
                  loading={loading}
                  className="mb-4"
                />
              ) : (
                <ProductList
                  products={products}
                  onProductClick={handleProductClick}
                  showAddToCart={auth.isAuthenticated}
                  loading={loading}
                  className="mb-4"
                />
              )}

              {/* Pagination */}
              <PaginationComponent
                pagination={pagination}
                onPageChange={updatePage}
                onPageSizeChange={updatePageSize}
                showPageSizeSelector={true}
                className="mt-4"
              />
            </>
          )}

          {/* Empty State - show if not loading and no products */}
          {!isLoading && !hasProducts && (
            <Alert variant="info">
              <Alert.Heading>No products found</Alert.Heading>
              <p>Try adjusting your search or filters to find products.</p>
            </Alert>
          )}
        </Container>
      </div>
    );
  }

  // Default case - return null for safety
  return null;
}

function App() {
  return (
    <AuthProvider>
      <GuestModeProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </GuestModeProvider>
    </AuthProvider>
  );
}

export default App;
