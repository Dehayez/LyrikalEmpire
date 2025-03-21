import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { ClipLoader } from 'react-spinners';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return <div className="spinner-container"><ClipLoader size={50} color={"#FFCC44"} loading={isLoading} /></div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;