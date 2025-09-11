import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'https://chl-backend.functorz.work', 
  withCredentials: true, // Important for cookies/session authentication
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // You could redirect to login or handle unauthorized access
      console.error('Authentication error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Search for users, todos, and groups
export const searchItems = async (query) => {
  try {
    const response = await api.get(`/api/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// Get another user's profile
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/api/search/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('User profile fetch error:', error);
    throw error;
  }
};

export default api;