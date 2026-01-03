import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AgentRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center dark:text-gray-300">Loading...</div>;
  }

  // If user is loaded and is an AGENT, ADMIN, or MODERATOR, show the page.
  return user && (user.role === 'agent' || user.role === 'admin' || user.role === 'moderator')
    ? <Outlet />
    : <Navigate to="/login" replace />; // Redirect to login if not
};

export default AgentRoute;