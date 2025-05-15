import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

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
        // ✅ Garante que o header é atualizado ANTES da requisição
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
      const { token, user, username } = response.data;

      localStorage.setItem('token', token);
      
      // ✅ Atualiza headers do Axios imediatamente
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // ✅ Estrutura segura para dados do usuário
      const userPayload = user || { username: username || credentials.username };
      localStorage.setItem('user', JSON.stringify(userPayload));
      setUser(userPayload);
      
      setIsAuthenticated(true);
      return true;

    } catch (error) {
      console.error('Erro no login:', error);
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
