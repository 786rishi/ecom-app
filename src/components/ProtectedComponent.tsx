import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useGuestMode } from '../contexts/GuestModeContext';

interface ProtectedComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({ 
  children, 
  fallback, 
  requireAuth = true 
}) => {
  const { auth } = useAuth();
  const { isGuestMode } = useGuestMode();

  // If not in guest mode and authentication is required
  if (!isGuestMode && requireAuth && !auth.isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert variant="warning" className="text-center py-4">
        <Alert.Heading>Login Required</Alert.Heading>
        <p className="mb-3">
          Please login to access this feature. You can browse products as a guest, 
          but you need to login to add items to cart and checkout.
        </p>
        <Button variant="primary" onClick={() => window.dispatchEvent(new CustomEvent('showLogin'))}>
          Login to Continue
        </Button>
      </Alert>
    );
  }

  // In guest mode or authenticated, show children
  return <>{children}</>;
};

export default ProtectedComponent;
