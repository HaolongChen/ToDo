import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { LoadingIcon } from './LoadingIcon';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingIcon />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
}

export function AuthRedirect({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setInitialLoading(false);
    }
  }, [loading]);

  if (initialLoading) {
    return <LoadingIcon />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}