import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Not authenticated - redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated but not admin - redirect to home and show error
  if (user?.role !== 'admin') {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  // Authenticated and is admin - allow access
  return children;
};

export default AdminRoute;
