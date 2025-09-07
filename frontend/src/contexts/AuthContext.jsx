import React, { createContext, useContext, useState, useEffect } from "react";
import {
  authAPI,
  setAuthToken,
  isAuthenticated,
  getCurrentUserId,
} from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // For initial auth check
  const [authLoading, setAuthLoading] = useState(false); // For login/register operations
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid token
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      setError(null);

      const response = await authAPI.login({ email, password });

      // Set token in API client
      setAuthToken(response.token);

      // Set user data
      setUser(response.user);

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setAuthLoading(true);
      setError(null);

      const response = await authAPI.register(userData);

      // Set token in API client
      setAuthToken(response.token);

      // Set user data
      setUser(response.user);

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAuthToken(null);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    authLoading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
    userId: user?.$id || getCurrentUserId(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
