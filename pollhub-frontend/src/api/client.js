import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
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

// Função para buscar votos do usuário logado
api.getUserVotes = async () => {
  const response = await api.get('/api/users/me/votes');
  return response.data;
};

// GET /api/polls/{id}/results
api.getPollResults = async (pollId) => {
  const response = await api.get(`/api/polls/${pollId}/results`);
  return response.data;
};

// GET /api/votes/poll/{pollId}
api.getPollVotes = async (pollId) => {
  const response = await api.get(`/api/votes/poll/${pollId}`);
  return response.data;
};

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