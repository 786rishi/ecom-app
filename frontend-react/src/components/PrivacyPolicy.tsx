import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import './PrivacyPolicy.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-policy-page">
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-subtitle">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="privacy-card mb-4">
          <Card.Body className="p-4">
            <h2 className="section-title mb-3">1. Information We Collect</h2>
            <p className="section-content">
              We collect information to provide better services to all our users. The types of information we collect include:
            </p>
            <ul className="privacy-list">
              <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping address when you create an account or make a purchase.</li>
              <li><strong>Account Information:</strong> Username, password, and purchase history.</li>
              <li><strong>Payment Information:</strong> Credit card details and billing information (processed securely through third-party payment processors).</li>
              <li><strong>Usage Data:</strong> Information about how you use our website, products, and services.</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
            </ul>
          </Card.Body>
        </Card>

        <Card className="privacy-card mb-4">
          <Card.Body className="p-4">
            <h2 className="section-title mb-3">2. How We Use Your Information</h2>
            <p className="section-content">
              We use the information we collect to provide, maintain, and improve our services:
            </p>
            <ul className="privacy-list">
              <li>Process and fulfill your orders</li>
              <li>Provide customer support and respond to your inquiries</li>
              <li>Personalize your shopping experience</li>
              <li>Send you transactional emails and marketing communications (with your consent)</li>
              <li>Detect and prevent fraud, abuse, and security issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Card.Body>
        </Card>

        <Card className="privacy-card mb-4">
          <Card.Body className="p-4">
            <h2 className="section-title mb-3">3. Information Sharing</h2>
            <p className="section-content">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
            </p>
            <ul className="privacy-list">
              <li><strong>Service Providers:</strong> We share information with trusted third-party service providers who assist us in operating our website and conducting our business.</li>
              <li><strong>Payment Processors:</strong> We share payment information with payment processors to process your transactions securely.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in good faith belief that such disclosure is necessary.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.</li>
            </ul>
          </Card.Body>
        </Card>

        <Card className="privacy-card mb-4">
          <Card.Body className="p-4">
            <h2 className="section-title mb-3">4. Data Security</h2>
            <p className="section-content">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </Card.Body>
        </Card>

        <Card className="privacy-card mb-4">
          <Card.Body className="p-4">
            <h2 className="section-title mb-3">5. Cookies and Tracking Technologies</h2>
            <p className="section-content">
              We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </Card.Body>
        </Card>

        <Card className="privacy-card mb-4">
          <Card.Body className="p-4">
            <h2 className="section-title mb-3">6. Your Rights</h2>
            <p className="section-content">
              You have the following rights regarding your personal information:
            </p>
            <ul className="privacy-list">
              <li><strong>Access:</strong> Request access to your personal information.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate personal information.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information.</li>
              <li><strong>Portability:</strong> Request transfer of your personal information to another service provider.</li>
              <li><strong>Objection:</strong> Object to processing of your personal information.</li>
            </ul>
          </Card.Body>
        </Card>

        <Card className="privacy-card mb-4">
          <Card.Body className="p-4">
            <h2 className="section-title mb-3">7. Children's Privacy</h2>
            <p className="section-content">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </Card.Body>
        </Card>

        <Card className="privacy-card mb-4">
          <Card.Body className="p-4">
            <h2 className="section-title mb-3">8. Changes to This Privacy Policy</h2>
            <p className="section-content">
              We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date at the top.
            </p>
          </Card.Body>
        </Card>

        <Card className="privacy-card mb-4">
          <Card.Body className="p-4">
            <h2 className="section-title mb-3">9. Contact Us</h2>
            <p className="section-content">
              If you have any questions about this privacy policy, please contact us:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@mcartstore.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Address:</strong> 123 Commerce Street, Shopping District, ST 12345</p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;
