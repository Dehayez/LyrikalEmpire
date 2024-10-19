import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a spinner or any loading indicator
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;