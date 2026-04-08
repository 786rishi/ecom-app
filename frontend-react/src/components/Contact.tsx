import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import './Contact.css';

const Contact: React.FC = () => {
  return (
    <div className="contact-page">
      <Container fluid className="contact-container">
        <Row className="contact-header">
          <Col>
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-subtitle">Get in touch with Mcart Store</p>
          </Col>
        </Row>
        
        <Row className="contact-content">
          {/* Map Section - Left and Middle */}
          <Col lg={8} md={7} className="map-section">
            <Card className="map-card">
              <Card.Header className="map-header">
                <h3>Our Location</h3>
              </Card.Header>
              <Card.Body className="map-body">
                <div className="map-placeholder">
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0060%2C40.7128%2C-73.9352%2C40.7614&layer=mapnik&marker=40.7489%2C-73.9680"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Mcart Store Location"
                    className="map-iframe"
                  />
                </div>
                <div className="map-info">
                  <p className="map-address">
                    <strong>Store Address:</strong><br />
                    123 Commerce Street<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Contact Details Section - Right */}
          <Col lg={4} md={5} className="contact-details-section">
            <Card className="contact-card">
              <Card.Header className="contact-header">
                <h3>Contact Information</h3>
              </Card.Header>
              <Card.Body className="contact-body">
                <div className="contact-item">
                  <div className="profile-image-container">
                    <img 
                      src="/rishi_pic.jpeg" 
                      alt="Rishi Saini" 
                      className="profile-image"
                    />
                  </div>
                  <div className="contact-info">
                    <h4>Name</h4>
                    <p>Rishi Saini</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="bi bi-telephone"></i>
                  </div>
                  <div className="contact-info">
                    <h4>Mobile Number</h4>
                    <p><a href="tel:+918708126635">+91 87081 26635</a></p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <div className="contact-info">
                    <h4>Email</h4>
                    <p><a href="mailto:support@mcart.com">support@mcart.com</a></p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="bi bi-clock"></i>
                  </div>
                  <div className="contact-info">
                    <h4>Business Hours</h4>
                    <p>
                      Monday - Friday: 9:00 AM - 8:00 PM<br />
                      Saturday: 10:00 AM - 6:00 PM<br />
                      Sunday: 11:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="bi bi-headset"></i>
                  </div>
                  <div className="contact-info">
                    <h4>Customer Support</h4>
                    <p>24/7 Online Support Available</p>
                    <button className="support-btn">
                      Start Live Chat
                    </button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="contact-footer">
          <Col>
            <Card className="footer-card">
              <Card.Body>
                <div className="footer-content">
                  <h3>Get in Touch</h3>
                  <p>Have questions about our products or services? We're here to help!</p>
                  <div className="footer-actions">
                    <button className="footer-btn primary">Send Message</button>
                    <button className="footer-btn secondary">Call Us</button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;
