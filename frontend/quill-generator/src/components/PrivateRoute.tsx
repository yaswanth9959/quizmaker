import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from "../AuthContext";
import { jwtDecode } from "jwt-decode";

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Token is expired
          logout();
        }
      } catch (e) {
        // Token is malformed or invalid
        logout();
      }
    }
    setLoading(false);
  }, [logout]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};