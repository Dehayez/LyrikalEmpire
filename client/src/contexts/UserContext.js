import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ email: '', username: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');

        if (token) {
          const userDetails = await userService.getUserDetails(token);
          setUser({ email: userDetails.email, username: userDetails.username });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const login = async (identifier, password) => {
    setIsLoading(true);
    try {
      const { token, email, username } = await userService.login({ email: identifier, password });
      localStorage.setItem('token', token);
      setUser({ email, username });
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser({ email: '', username: '' });
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <UserContext.Provider value={{ isAuthenticated, isLoading, login, logout, user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);