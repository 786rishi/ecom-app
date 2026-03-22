import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  show: boolean;
  onHide: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onHide }) => {
  const { auth, login, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (auth.error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }
    
    await login(formData.email, formData.password);
    
    if (!auth.error) {
      // Login successful, close modal
      onHide();
      // Reset form
      setFormData({ email: '', password: '' });
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '' });
    clearError();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Login to Your Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="small">
          <strong>Demo Credentials:</strong><br />
          Email: test@gmail.com<br />
          Password: admin
        </Alert>
        
        {auth.error && (
          <Alert variant="danger" dismissible onClose={clearError}>
            {auth.error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              disabled={auth.loading}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              disabled={auth.loading}
            />
          </Form.Group>

          <div className="d-grid">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={auth.loading}
            >
              {auth.loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LoginModal;
