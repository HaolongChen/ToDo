import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000', // Change this to your actual backend URL
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

export default api;