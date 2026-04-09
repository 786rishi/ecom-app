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
              <span className="social-icon">📘</span>
              <span className="social-icon">🐦</span>
              <span className="social-icon">📷</span>
              <span className="social-icon">💼</span>
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
                <a href="#contact" onClick={handleContactClick}>
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
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 123 Commerce Street</p>
              <p>🏙️ Shopping District, ST 12345</p>
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
