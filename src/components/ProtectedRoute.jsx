import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center dark:text-gray-300">Loading...</div>;
  }

  // If user is loaded, show the page. Otherwise, redirect to login.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;