import React, { useEffect, useState } from 'react';
import { Container, Alert, Row, Col } from 'react-bootstrap';
import AppHeader from './components/AppHeader';
import ProfessionalNavBar from './components/ProfessionalNavBar';
import ProductGrid from './components/ProductGrid';
import ProductList from './components/ProductList';
import PaginationComponent from './components/Pagination';
import LoadingSpinner from './components/LoadingSpinner';
import SearchResults from './components/SearchResults';
import LandingPage from './components/LandingPage';

const KEYCLOAK_BASE_URL = process.env.REACT_APP_KEYCLOAK_BASE_URL || 'http://localhost:8080';
const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';
import AddProduct from './components/AddProduct';
import InventoryManagement from './components/InventoryManagement';
import Contact from './components/Contact';
import Promotions from './components/Promotions';
import FeaturedProductsCarousel from './components/FeaturedProductsCarousel';
import ProductDetails from './components/ProductDetails';
import PrivacyPolicy from './components/PrivacyPolicy';
import OrderHistory from './components/OrderHistory';
import Wishlist from './components/Wishlist';
import AdvanceFilter from './components/AdvanceFilter';
import Footer from './components/Footer';
import { useProducts, setStateChangeCallback } from './hooks/useProducts';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GuestModeProvider, useGuestMode } from './contexts/GuestModeContext';
import { Product } from './types/product';
import { productService, AdvancedSearchFilters } from './services/productService';
import './App.css';
import keycloak from './services/keycloak';

type AppState = 'main' | 'browse' | 'add-product' | 'inventory-management' | 'contact' | 'promotions' | 'product-details' | 'privacy-policy' | 'order-history' | 'wishlist';

// Track previous render to compare
let lastRenderProducts: any = undefined;
let renderCounter = 0;

// MOVED OUTSIDE: AppContent must be defined outside of App to prevent recreation
function AppContent() {

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [appState, setAppState] = useState<AppState>('main');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [, setForceRender] = useState(0); // Component-level state to trigger re-renders
  const { isGuestMode, setIsGuestMode } = useGuestMode();
  const { auth } = useAuth();

  // Advanced filter state
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<AdvancedSearchFilters>({});
  const [filterLoading, setFilterLoading] = useState(false);
  const [clearFiltersLoading, setClearFiltersLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(null);
  const [isAdvancedFilterActive, setIsAdvancedFilterActive] = useState(false);
  const [advancedFilterPagination, setAdvancedFilterPagination] = useState<any>(null);

  // Register callback to be called when hook state changes
  React.useEffect(() => {
    setStateChangeCallback(() => {
      setForceRender(prev => prev + 1);
    });
  }, []);

  const hookReturn = useProducts();
  const { products, allProducts, loading, error, searchQuery, pagination, updatePage, updatePageSize, clearFilters, stateVersion } = hookReturn;


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

  const handleLogin = async () => {

          const authenticated = await keycloak.init({
            onLoad: "check-sso",   // ✅ better here
          //  pkceMethod: "S256",
            checkLoginIframe: false,
          });

    //window.open(`${KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/auth?client_id=fb-login&redirect_uri=${REACT_APP_BASE_URL}&state=f7d4b3fd-5ec0-4f51-ac5f-273aeeba1696&response_mode=query&response_type=code&scope=openid&nonce=81ad7d0a-b7ed-4705-8f73-ed4682143379&code_challenge=Z57CRwqdPDpdWKKqnyL8OxnqO0JGV1R3pTjB55qiKMQ&code_challenge_method=S256`, '_self');
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
    setSelectedProduct(product);
    setAppState('product-details');
  };

  const handleSearchClear = () => {
    clearFilters();
  };

  const handleSuggestionClick = (suggestion: string) => {
    // TODO: Implement suggestion click

  };

  const handleNavigateHome = () => {
    setSelectedProduct(null);
    setAppState('main');
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setAppState('browse');
  };

  const handleCategorySelect = async (category: string) => {
    try {
      // Make sure we're in browse state
      if (appState !== 'browse') {
        setAppState('browse');
      }

      // Use advanced search API with category as keyword
      setFilterLoading(true);
      setCurrentFilters({ keyword: category });
      setIsAdvancedFilterActive(true);

      const searchFilters: AdvancedSearchFilters = {
        keyword: category,
        page: 0,
        size: 12
      };

      const response = await productService.advancedSearch(searchFilters);

      // Update products with category results
      if (response && response.content && Array.isArray(response.content)) {
        setFilteredProducts(response.content);
        setAdvancedFilterPagination({
          page: response.number + 1,
          pageSize: response.size,
          total: response.totalElements,
          totalPages: response.totalPages
        });
        setForceRender(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setFilterLoading(false);
    }
  };

  // Advanced filter handlers
  const handleFiltersApply = async (filters: AdvancedSearchFilters) => {
    setFilterLoading(true);
    setCurrentFilters(filters);

    try {
      const response = await productService.advancedSearch(filters);

      // Update products with filtered results
      if (response && response.content && Array.isArray(response.content)) {
        setFilteredProducts(response.content);
        setIsAdvancedFilterActive(true);
        setAdvancedFilterPagination({
          page: response.number + 1,
          pageSize: response.size,
          total: response.totalElements,
          totalPages: response.totalPages
        });
        setForceRender(prev => prev + 1);
        // Close modal after successfully applying filters
        setShowAdvancedFilter(false);
      }
    } catch (error) {
      console.error('Error applying advanced filters:', error);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleFiltersClear = async () => {
    try {
      // Step 1: Clear the loaded products list immediately
      setFilteredProducts(null);
      setIsAdvancedFilterActive(false);
      setAdvancedFilterPagination(null);

      // Step 2: Set loading to true to show loader
      setClearFiltersLoading(true);

      // Step 3: Clear filter states
      setCurrentFilters({});

      // Step 4: Use hook's clearFilters function to fetch fresh data
      const { clearFilters } = hookReturn;
      clearFilters();

      // Step 5: Wait for the hook to complete the API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 6: Force component re-render to ensure UI updates with fresh data
      setForceRender(prev => prev + 1);

    } catch (error) {
      console.error('Error clearing filters:', error);
    } finally {
      // Step 7: Hide loader
      setClearFiltersLoading(false);
    }
  };

  const handleAdvancedFilterClick = () => {
    setShowAdvancedFilter(true);
  };

  const handleAdvancedFilterHide = () => {
    setShowAdvancedFilter(false);
  };

  const handleSearch = (query: string) => {
    // Clear advanced filter state if doing a new search
    if (query.trim() !== '') {
      setFilteredProducts(null);
      setIsAdvancedFilterActive(false);
      setAdvancedFilterPagination(null);
      setCurrentFilters({});
    }

    // Use hook's updateSearchQuery function directly - let the hook handle loading
    const { updateSearchQuery } = hookReturn;
    updateSearchQuery(query);
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
      } else if (hash === 'promotions' && auth.isAuthenticated && auth.user?.roles?.includes('admin')) {
        setAppState('promotions');
      } else if (hash === 'OrderHistory' && auth.isAuthenticated) {
        setAppState('order-history');
      } else if (hash === 'wishlist' && auth.isAuthenticated) {
        setAppState('wishlist');
      } else if (hash === 'contact') {
        setAppState('contact');
      } else if (hash === 'OrderHistory' && !auth.isAuthenticated) {
        // Redirect non-authenticated users to main
        setAppState('main');
        window.location.hash = '';
      } else if (hash === 'wishlist' && !auth.isAuthenticated) {
        // Redirect non-authenticated users to main
        setAppState('main');
        window.location.hash = '';
      } else if (hash === 'product' || hash === 'Inventory' || hash === 'promotions') {
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
          setAppState={setAppState}
        />
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isGuestMode={isGuestMode}
          onLogin={handleLogin}
          onNavigateHome={handleNavigateHome}
          onCategorySelect={handleCategorySelect}
          onAdvancedFilterClick={handleAdvancedFilterClick}
          onClearAdvancedFilters={handleFiltersClear}
          onSearch={handleSearch}
          hasActiveFilters={isAdvancedFilterActive}
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
          setAppState={setAppState}
        />
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isGuestMode={isGuestMode}
          onLogin={handleLogin}
          onNavigateHome={handleNavigateHome}
          onCategorySelect={handleCategorySelect}
          onAdvancedFilterClick={handleAdvancedFilterClick}
          onClearAdvancedFilters={handleFiltersClear}
          onSearch={handleSearch}
          hasActiveFilters={isAdvancedFilterActive}
        />
        <InventoryManagement />
      </div>
    );
  }

  // Show contact page
  if (appState === 'contact') {
    return (
      <div className="App">
        <ProfessionalNavBar
          isGuestMode={isGuestMode}
          onNavigateHome={handleNavigateHome}
          setAppState={setAppState}
        />
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isGuestMode={isGuestMode}
          onLogin={handleLogin}
          onNavigateHome={handleNavigateHome}
          onCategorySelect={handleCategorySelect}
          onAdvancedFilterClick={handleAdvancedFilterClick}
          onClearAdvancedFilters={handleFiltersClear}
          onSearch={handleSearch}
          hasActiveFilters={isAdvancedFilterActive}
        />
        <Contact />
        <Footer onNavigateHome={handleNavigateHome} setAppState={setAppState} />
      </div>
    );
  }

  // Show product details page
  if (appState === 'product-details' && selectedProduct) {
    return (
      <div className="App">
        <ProfessionalNavBar
          isGuestMode={isGuestMode}
          onNavigateHome={handleNavigateHome}
          setAppState={setAppState}
        />
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isGuestMode={isGuestMode}
          onLogin={handleLogin}
          onNavigateHome={handleNavigateHome}
          onCategorySelect={handleCategorySelect}
          onAdvancedFilterClick={handleAdvancedFilterClick}
          onClearAdvancedFilters={handleFiltersClear}
          onSearch={handleSearch}
          hasActiveFilters={isAdvancedFilterActive}
        />
        <ProductDetails
          product={selectedProduct}
          onBack={handleBackToProducts}
          isAuthenticated={auth.isAuthenticated}
        />
      </div>
    );
  }

  // Show promotions page
  if (appState === 'promotions') {
    return (
      <div className="App">
        <ProfessionalNavBar
          isGuestMode={isGuestMode}
          onNavigateHome={handleNavigateHome}
          setAppState={setAppState}
        />
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isGuestMode={isGuestMode}
          onLogin={handleLogin}
          onNavigateHome={handleNavigateHome}
          onCategorySelect={handleCategorySelect}
          onAdvancedFilterClick={handleAdvancedFilterClick}
          onClearAdvancedFilters={handleFiltersClear}
          onSearch={handleSearch}
          hasActiveFilters={isAdvancedFilterActive}
        />
        <Promotions />
        <Footer onNavigateHome={handleNavigateHome} setAppState={setAppState} />
      </div>
    );
  }

  // Show privacy policy page
  if (appState === 'privacy-policy') {
    return (
      <div className="App">
        <ProfessionalNavBar
          isGuestMode={isGuestMode}
          onNavigateHome={handleNavigateHome}
          setAppState={setAppState}
        />
        <PrivacyPolicy />
        <Footer onNavigateHome={handleNavigateHome} setAppState={setAppState} />
      </div>
    );
  }

  // Show order history page
  if (appState === 'order-history') {
    return (
      <div className="App">
        <ProfessionalNavBar
          isGuestMode={isGuestMode}
          onNavigateHome={handleNavigateHome}
          setAppState={setAppState}
        />
        <OrderHistory />
        <Footer onNavigateHome={handleNavigateHome} setAppState={setAppState} />
      </div>
    );
  }

  // Show wishlist page
  if (appState === 'wishlist') {
    return (
      <div className="App">
        <ProfessionalNavBar
          isGuestMode={isGuestMode}
          onNavigateHome={handleNavigateHome}
          setAppState={setAppState}
        />
        <Wishlist />
        <Footer onNavigateHome={handleNavigateHome} setAppState={setAppState} />
      </div>
    );
  }

  // Show products page
  if (appState === 'browse') {
    // Use filtered products if advanced filter is active, otherwise use normal products
    const displayProducts = isAdvancedFilterActive ? filteredProducts : products;
    const hasProducts = displayProducts && Array.isArray(displayProducts) && displayProducts.length > 0;
    const isLoading = loading || filterLoading || clearFiltersLoading;
    const displayPagination = isAdvancedFilterActive ? advancedFilterPagination : pagination;

    return (
      <div className="App">
        <ProfessionalNavBar
          isGuestMode={isGuestMode}
          onNavigateHome={handleNavigateHome}
          setAppState={setAppState}
        />
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isGuestMode={isGuestMode}
          onLogin={handleLogin}
          onNavigateHome={handleNavigateHome}
          onCategorySelect={handleCategorySelect}
          onAdvancedFilterClick={handleAdvancedFilterClick}
          onClearAdvancedFilters={handleFiltersClear}
          onSearch={handleSearch}
          hasActiveFilters={isAdvancedFilterActive}
        />

        {/* Featured Products Carousel */}
        <FeaturedProductsCarousel
          onProductClick={handleProductClick}
          showAddToCart={auth.isAuthenticated}
          showWishlist={auth.isAuthenticated}
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
          {/* <SearchResults
            products={products}
            allProducts={allProducts}
            query={searchQuery}
            loading={loading}
            onClearSearch={handleSearchClear}
            onSuggestionClick={handleSuggestionClick}
            className="mb-4"
          /> */}

          {/* Loading Spinner - show when loading or clearing filters */}
          {isLoading && (
            <LoadingSpinner
              text={clearFiltersLoading ? "Clearing filters..." : "Loading products..."}
              centered
              size="lg"
            />
          )}

          {/* Products Display - show if products exist, regardless of loading state */}
          {hasProducts && (
            <>
              {viewMode === 'grid' ? (
                <ProductGrid
                  products={displayProducts || []}
                  onProductClick={handleProductClick}
                  showAddToCart={auth.isAuthenticated}
                  showWishlist={auth.isAuthenticated}
                  loading={isLoading}
                  className="mb-4"
                  columns={{

                    md: 3

                  }}
                />
              ) : (
                <ProductList
                  products={displayProducts || []}
                  onProductClick={handleProductClick}
                  showAddToCart={auth.isAuthenticated}
                  showWishlist={auth.isAuthenticated}
                  loading={isLoading}
                  className="mb-4"
                />
              )}

              {/* Pagination */}
              {displayPagination && (
                <PaginationComponent
                  pagination={displayPagination}
                  onPageChange={isAdvancedFilterActive ? (page) => {
                    // For advanced filter, we need to re-apply filters with new page
                    const newFilters = { ...currentFilters, page: page - 1 };
                    handleFiltersApply(newFilters);
                  } : updatePage}
                  onPageSizeChange={isAdvancedFilterActive ? (size) => {
                    // For advanced filter, we need to re-apply filters with new size
                    const newFilters = { ...currentFilters, size, page: 0 };
                    handleFiltersApply(newFilters);
                  } : updatePageSize}
                  showPageSizeSelector={true}
                  className="mt-4"
                />
              )}
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

        {/* Advanced Filter Modal */}
        <AdvanceFilter
          show={showAdvancedFilter}
          onHide={handleAdvancedFilterHide}
          onFiltersApply={handleFiltersApply}
          onFiltersClear={handleFiltersClear}
          loading={filterLoading}
          currentFilters={currentFilters}
        />

        <Footer onNavigateHome={handleNavigateHome} setAppState={setAppState} />
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