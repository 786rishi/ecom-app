import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const KEYCLOAK_BASE_URL = process.env.REACT_APP_KEYCLOAK_BASE_URL || 'http://localhost:8080';

interface LoginModalProps {
  show: boolean;
  onHide: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onHide }) => {
  const { auth, clearError } = useAuth();

  const handleLogin = () => {
    window.open(`${KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/auth?client_id=fb-login&redirect_uri=http%3A%2F%2Flocalhost%3A3000&state=f7d4b3fd-5ec0-4f51-ac5f-273aeeba1696&response_mode=query&response_type=code&scope=openid&nonce=81ad7d0a-b7ed-4705-8f73-ed4682143379&code_challenge=Z57CRwqdPDpdWKKqnyL8OxnqO0JGV1R3pTjB55qiKMQ&code_challenge_method=S256`, '_self');
    onHide(); // Close modal immediately since redirect will happen
  };

  const handleClose = () => {
    clearError();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Login to Your Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="text-center">
          <Alert.Heading>Keycloak Authentication</Alert.Heading>
          <p className="mb-3">
            Click the button below to authenticate using Keycloak.
            You will be redirected to the Keycloak login page.
          </p>
        </Alert>
        
        {auth.error && (
          <Alert variant="danger" dismissible onClose={clearError}>
            {auth.error}
          </Alert>
        )}

        <div className="text-center">
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleLogin}
          >
            Login with Keycloak
          </Button>
          
          <div className="mt-3">
            <small className="text-muted">
              You will be redirected to a secure login page.
            </small>
          </div>
        </div>
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
