import React, { useEffect, useState } from 'react';
import { Container, Alert } from 'react-bootstrap';
import AppHeader from './components/AppHeader';
import ProductGrid from './components/ProductGrid';
import ProductList from './components/ProductList';
import Pagination from './components/Pagination';
import LoadingSpinner from './components/LoadingSpinner';
import SearchResults from './components/SearchResults';
import LandingPage from './components/LandingPage';
import { useProducts } from './hooks/useProducts';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GuestModeProvider, useGuestMode } from './contexts/GuestModeContext';
import { Product } from './types/product';
import './App.css';

type AppState = 'main' | 'browse';

function AppContent() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [appState, setAppState] = useState<AppState>('main');
  const { isGuestMode, setIsGuestMode } = useGuestMode();
  const { auth } = useAuth();
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
    console.log('Suggestion clicked:', suggestion);
  };

  // Listen for login success event
  React.useEffect(() => {
    const handleLoginSuccess = () => {
      setIsGuestMode(false);
      setAppState('browse');
      console.log("login success")
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);
    return () => window.removeEventListener('loginSuccess', handleLoginSuccess);
  }, [setIsGuestMode, setAppState]);

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

  // Show products page
  if (appState === 'browse') {
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
