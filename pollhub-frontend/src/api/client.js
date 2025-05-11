import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// interceptor para depuração
api.interceptors.request.use(request => {
  console.log('Requisição:', request);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Resposta:', response);
    return response;
  },
  error => {
    console.error('Erro API:', error);
    return Promise.reject(error);
  }
);

export default api;