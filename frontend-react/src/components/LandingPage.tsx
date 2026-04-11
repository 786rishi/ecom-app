import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onLogin: () => void;
  onBrowseAsGuest: () => void;
  onAuthenticated?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onBrowseAsGuest, onAuthenticated }) => {
  const { auth } = useAuth();

  // If user is already logged in, redirect to products immediately
  React.useEffect(() => {
    if (auth.isAuthenticated) {
      onAuthenticated?.();
    }
  }, [auth.isAuthenticated, onAuthenticated]);

  // Don't render anything if redirecting
  if (auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="landing-page min-vh-100">
      {/* Hero Section */}
      <div className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold mb-4">🛍️ Welcome to E-Commerce Store</h1>
              <p className="lead mb-4">
                Discover amazing products at great prices. Shop with confidence and enjoy a seamless shopping experience.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Button variant="light" size="lg" onClick={onLogin} className="px-4">
                  Login / Register
                </Button>
                <Button variant="outline-light" size="lg" onClick={onBrowseAsGuest} className="px-4">
                  Browse as Guest
                </Button>
              </div>
            </Col>
            <Col md={6}>
              <div className="text-center">
                <div style={{ fontSize: '8rem', opacity: 0.8 }}>🛒</div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="h3 mb-4">Why Shop With Us?</h2>
            <p className="text-muted">Experience the best in online shopping</p>
          </Col>
        </Row>

        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <Card.Title as="h5" className="mb-3">Easy Search</Card.Title>
                <Card.Text className="text-muted">
                  Find exactly what you're looking for with our powerful search and filtering system.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚚</div>
                <Card.Title as="h5" className="mb-3">Fast Delivery</Card.Title>
                <Card.Text className="text-muted">
                  Quick and reliable delivery right to your doorstep.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
                <Card.Title as="h5" className="mb-3">Secure Payment</Card.Title>
                <Card.Text className="text-muted">
                  Safe and secure payment processing for your peace of mind.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Account Types Section */}
      <Container className="py-5 bg-light">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="h3 mb-4">Choose Your Experience</h2>
            <p className="text-muted">Different options for different needs</p>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow">
              <Card.Body className="p-4">
                <Card.Title as="h4" className="mb-3 text-primary">
                  📱 Full Account (Login Required)
                </Card.Title>
                <ul className="list-unstyled mb-4">
                  <li className="mb-2">✅ Add products to cart</li>
                  <li className="mb-2">✅ Checkout and purchase</li>
                  <li className="mb-2">✅ Save preferences</li>
                  <li className="mb-2">✅ Order history</li>
                  <li className="mb-2">✅ Personalized recommendations</li>
                </ul>
                <Button variant="primary" onClick={onLogin} className="w-100">
                  Login / Register
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow">
              <Card.Body className="p-4">
                <Card.Title as="h4" className="mb-3 text-secondary">
                  👀 Guest Browsing (No Login)
                </Card.Title>
                <ul className="list-unstyled mb-4">
                  <li className="mb-2">✅ Browse all products</li>
                  <li className="mb-2">✅ Search and filter</li>
                  <li className="mb-2">✅ View product details</li>
                  <li className="mb-2">❌ Add to cart</li>
                  <li className="mb-2">❌ Checkout</li>
                </ul>
                <Button variant="outline-secondary" onClick={onBrowseAsGuest} className="w-100">
                  Browse as Guest
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Demo Credentials */}
      <Container className="py-4">
        <Card className="bg-info text-white border-0">
          <Card.Body className="text-center">
            <Card.Title as="h5" className="mb-3">Demo Account</Card.Title>
            <p className="mb-2">
              <strong>Email:</strong> test@gmail.com | <strong>Password:</strong> admin
            </p>
            <p className="mb-0 small">
              Use these credentials to experience the full shopping features!
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LandingPage;
