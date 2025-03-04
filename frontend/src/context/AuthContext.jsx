import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/auth/user');
        setUser(response.data.user);
      } catch (error) {
        console.log('Not authenticated');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/auth/signin', { username, password });
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to sign in");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign-up function
  const signup = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/auth/signup', { username, password });
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to sign up");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post('/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        signup, 
        logout, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};