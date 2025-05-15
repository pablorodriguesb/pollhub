import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar o token em cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para lidar com erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber erro 401 (não autorizado), limpa o localStorage
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Não redirecionamos aqui para evitar loops infinitos
    }
    return Promise.reject(error);
  }
);

export default api;