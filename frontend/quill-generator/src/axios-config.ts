import axios from 'axios';

// Set the default backend URL
axios.defaults.baseURL = 'http://localhost:5000';

// Add an interceptor to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// This module is now configured globally, so no export is needed.