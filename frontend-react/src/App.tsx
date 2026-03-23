import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import AppHeader from './components/AppHeader';
import ProductGrid from './components/ProductGrid';
import ProductList from './components/ProductList';
import Pagination from './components/Pagination';
import LoadingSpinner from './components/LoadingSpinner';
import SearchResults from './components/SearchResults';
import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';
import { useProducts } from './hooks/useProducts';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { GuestModeProvider, useGuestMode } from './contexts/GuestModeContext';
import { Product } from './types/product';
import './App.css';

type AppState = 'landing' | 'products';

function AppContent() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [appState, setAppState] = useState<AppState>('landing');
  const [showLogin, setShowLogin] = useState(false);
  const { isGuestMode, setIsGuestMode } = useGuestMode();
  const {
    products,
    allProducts,
    loading,
    error,
    searchQuery,
    pagination,
    updatePage,
    updatePageSize,
    clearFilters
  } = useProducts();

  const handleLogin = () => {
    window.open('http://localhost:8080/realms/master/protocol/openid-connect/auth?client_id=fb-login&redirect_uri=http%3A%2F%2Flocalhost%3A3000&state=f7d4b3fd-5ec0-4f51-ac5f-273aeeba1696&response_mode=query&response_type=code&scope=openid&nonce=81ad7d0a-b7ed-4705-8f73-ed4682143379&code_challenge=Z57CRwqdPDpdWKKqnyL8OxnqO0JGV1R3pTjB55qiKMQ&code_challenge_method=S256', '_self');
    //setShowLogin(true);
  };

  const handleBrowseAsGuest = () => {
    setIsGuestMode(true);
    setAppState('products');
  };

  const handleProductClick = (product: Product) => {
    alert(`Product clicked: ${product.name}\n\nThis would navigate to the product detail page.`);
  };

  const handleSearchClear = () => {
    clearFilters();
  };

  const handleSuggestionClick = (suggestion: string) => {
    // TODO: Implement suggestion click
    console.log('Suggestion clicked:', suggestion);
  };

  // Listen for login success event
  React.useEffect(() => {
    const handleLoginSuccess = () => {
      setIsGuestMode(false);
      setAppState('products');
      setShowLogin(false);
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);
    return () => window.removeEventListener('loginSuccess', handleLoginSuccess);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      console.log("Authorization Code:", code);

      // send to backend
      // fetch("http://localhost:8081/api/auth/exchange", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({ code })
      // });
    }
  }, []);

  // Show landing page
  if (appState === 'landing') {
    return (
      <>
        <LandingPage
          onLogin={handleLogin}
          onBrowseAsGuest={handleBrowseAsGuest}
        />
        <LoginModal
          show={showLogin}
          onHide={() => setShowLogin(false)}
        />
      </>
    );
  }

  // Show products page
  return (
    <div className="App">
      <AppHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isGuestMode={isGuestMode}
        onLogin={handleLogin}
      />

      <Container fluid className="py-4">
        {/* Error Display */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {/* Search Results Header */}
        <SearchResults
          products={products}
          allProducts={allProducts}
          query={searchQuery}
          loading={loading}
          onClearSearch={handleSearchClear}
          onSuggestionClick={handleSuggestionClick}
          className="mb-4"
        />

        {/* Loading Spinner */}
        {loading && products.length === 0 && (
          <LoadingSpinner
            text="Loading products..."
            centered
            size="lg"
          />
        )}

        {/* Products Display */}
        {!loading && (
          <>
            {viewMode === 'grid' ? (
              <ProductGrid
                products={products}
                onProductClick={handleProductClick}
                showAddToCart={true}
                loading={loading}
                className="mb-4"
              />
            ) : (
              <ProductList
                products={products}
                onProductClick={handleProductClick}
                showAddToCart={true}
                loading={loading}
                className="mb-4"
              />
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <Pagination
                pagination={pagination}
                onPageChange={updatePage}
                onPageSizeChange={updatePageSize}
                showPageSizeSelector={true}
                className="mt-4"
              />
            )}
          </>
        )}
      </Container>

      {/* Login Modal */}
      <LoginModal
        show={showLogin}
        onHide={() => setShowLogin(false)}
      />
    </div>
  );
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
