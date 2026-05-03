import axios from 'axios';

const isProduction = window.location.hostname !== 'localhost';

const api = axios.create({
  baseURL: isProduction ? '/api' : 'http://localhost:5001/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;