import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminProtectedComponentProps {
  children: React.ReactNode;
}

const AdminProtectedComponent: React.FC<AdminProtectedComponentProps> = ({ children }) => {
  const { auth } = useAuth();

  // Use exact same admin check logic as ProfessionalNavBar (line 164)
  const isAdmin = auth.isAuthenticated && auth.user?.roles?.includes('admin');

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminProtectedComponent;
