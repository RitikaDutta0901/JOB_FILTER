import axios from 'axios';
import { dispatchLogoutEvent } from '../utils/authEvents';

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
      // Dispatch an app-level logout event so React can navigate cleanly
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch logout event for React app to handle navigation
      dispatchLogoutEvent();
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

// Export API endpoints
export const exportService = {
  downloadCSV: (params) => api.get('/applications/csv', { params, responseType: 'blob' }),
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

// Notes API endpoints
export const noteService = {
  getByApplication: (appId) => api.get(`/applications/${appId}/notes`),
  create: (appId, content) => api.post(`/applications/${appId}/notes`, { content }),
  update: (noteId, content) => api.put(`/notes/${noteId}`, { content }),
  delete: (noteId) => api.delete(`/notes/${noteId}`),
};

// Interview Roadmap API endpoints
export const roadmapService = {
  getByApplication: (appId) => api.get(`/applications/${appId}/roadmap`),
  updateTopic: (topicId, isCompleted) => api.put(`/roadmap-topics/${topicId}`, { isCompleted }),
  regenerate: (appId) => api.post(`/applications/${appId}/roadmap/regenerate`),
};

export default api;
