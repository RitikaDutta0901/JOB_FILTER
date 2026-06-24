import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into headers if logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g. JWT expiry redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and reload if unauthorized (optional, handles session expiry)
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authService = {
  register: (username, email, password) => 
    api.post('/auth/register', { username, email, password }),
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
};

// Applications API endpoints
export const applicationService = {
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  getStats: () => api.get('/applications/stats'), // For Phase 4 Analytics Dashboard
};

// Interview Rounds API endpoints
export const roundService = {
  getByApplication: (appId) => api.get(`/applications/${appId}/rounds`),
  create: (appId, data) => api.post(`/applications/${appId}/rounds`, data),
  update: (roundId, data) => api.put(`/rounds/${roundId}`, data),
  delete: (roundId) => api.delete(`/rounds/${roundId}`),
};

// Companies API endpoints
export const companyService = {
  getAll: () => api.get('/companies'),
};

export default api;
