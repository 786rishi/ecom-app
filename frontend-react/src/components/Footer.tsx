import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css';

interface FooterProps {
  onNavigateHome?: () => void;
  setAppState?: (state: any) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigateHome, setAppState }) => {
  const currentYear = new Date().getFullYear();

  const handlePrivacyPolicyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppState?.('privacy-policy');
    window.scrollTo(0, 0);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppState?.('contact');
    window.location.hash = 'contact';
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <Container fluid>
        <Row className="footer-content">
          <Col md={4} className="footer-section">
            <h5 className="footer-title">MCart Store</h5>
            <p className="footer-description">
              Your trusted online shopping destination for quality products at great prices.
            </p>
            <div className="footer-social">
              <a 
                href="https://www.facebook.com/login" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon-link"
                aria-label="Facebook"
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/accounts/login" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon-link"
                aria-label="Instagram"
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com/login" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon-link"
                aria-label="X (Twitter)"
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/login" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon-link"
                aria-label="LinkedIn"
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </Col>
          
          <Col md={2} className="footer-section">
            <h5 className="footer-title">Quick Links</h5>
            <ul className="footer-links">
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); onNavigateHome?.(); }}>
                  Home
                </a>
              </li>
              <li>
                <a href="#products" onClick={(e) => { e.preventDefault(); setAppState?.('browse'); }}>
                  Products
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigateHome?.(); }}>
                  Contact
                </a>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="footer-section">
            <h5 className="footer-title">Customer Service</h5>
            <ul className="footer-links">
              <li>
                <a href="#privacy-policy" onClick={handlePrivacyPolicyClick}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => e.preventDefault()}>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#shipping" onClick={(e) => e.preventDefault()}>
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => e.preventDefault()}>
                  FAQ
                </a>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="footer-section">
            <h5 className="footer-title">Contact Info</h5>
            <div className="contact-info">
              <p>📧 support@mcartstore.com</p>
              <p>📞 +91 8708126635</p>
              <p>📍 Shopping Street</p>
              <p>🏙️ Shopping District, 12345</p>
            </div>
          </Col>
        </Row>
        
        <Row className="footer-bottom">
          <Col className="text-center">
            <p className="copyright">
              © {currentYear} MCart Store. All rights reserved. | 
              <a href="#privacy-policy" onClick={handlePrivacyPolicyClick} className="privacy-link">
                Privacy Policy
              </a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
