import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminProtectedComponentProps {
  children: React.ReactNode;
}

const AdminProtectedComponent: React.FC<AdminProtectedComponentProps> = ({ children }) => {
  const { auth } = useAuth();

  const isAdmin = auth.isAuthenticated && auth.user?.roles?.includes('admin');

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminProtectedComponent;
