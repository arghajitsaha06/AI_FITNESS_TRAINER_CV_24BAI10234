import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

const AuthContext = createContext();

const TOKEN_KEY = "fitai_auth_token";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await apiService.getMe(storedToken);
        if (isMounted && response?.user) {
          setCurrentUser(response.user);
          setToken(storedToken);
        }
      } catch (err) {
        console.warn("Failed to restore session token:", err.message);
        // Invalidate stale token
        localStorage.removeItem(TOKEN_KEY);
        if (isMounted) {
          setCurrentUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log in athlete with username/email and password
   */
  const login = async (usernameOrEmail, password) => {
    const data = await apiService.login({ usernameOrEmail, password });
    if (data?.access_token && data?.user) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setCurrentUser(data.user);
      return data.user;
    }
    throw new Error("Invalid response from login server.");
  };

  /**
   * Register new athlete
   */
  const signup = async (fullName, username, email, password) => {
    const data = await apiService.signup({ fullName, username, email, password });
    if (data?.access_token && data?.user) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setCurrentUser(data.user);
      return data.user;
    }
    throw new Error("Invalid response from signup server.");
  };

  /**
   * Log out athlete and clear credentials
   */
  const logout = async () => {
    try {
      if (token) {
        await apiService.logout(token);
      }
    } catch {
      // ignore
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: Boolean(currentUser && token),
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
