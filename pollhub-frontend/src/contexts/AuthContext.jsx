import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/client';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        await api.get('/api/users/me/polls');
        
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);

      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    const { token } = response.data;
    if (!token) throw new Error('Token não encontrado na resposta do servidor');

      const decoded = jwtDecode(token);
      
    // Crie o userPayload com os dados do JWT
    const userPayload = {
      username: decoded.sub,
      role: decoded.role,
      token: token
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userPayload));
    setUser(userPayload);
    setIsAuthenticated(true);
    return true;
  
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Limpeza mais agressiva em caso de erro
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      api.defaults.headers.common['Authorization'] = '';
      
      // Feedback mais específico para o usuário
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Credenciais inválidas');
        }
        throw new Error(`Erro do servidor: ${error.response.statusText}`);
      }
      
      return false;
    }
  };
  

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
