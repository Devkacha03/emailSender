import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  signup: (data) => api.post('/users/signUp', data),
  login: (data) => api.post('/users/signIn', data),
  getProfile: () => api.get('/users/profile'),
  changePassword: (data) => api.post('/users/change-password', data),
  forgotPassword: (data) => api.post('/users/forgot-password', data),
  setNewPassword: (token, data) => api.patch(`/users/setUpdatingPassword/${token}`, data),
};

// Email Config Services
export const emailConfigService = {
  setConfig: (data) => api.post('/email-config', data),
  getConfig: () => api.get('/email-config'),
};

// Email Services
export const emailService = {
  sendSingle: (formData) => {
    return api.post('/send-single-mail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  sendBulkFile: (formData) => {
    return api.post('/send-bulk-mail-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  sendBulkText: (formData) => {
    return api.post('/send-bulk-mail-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Email Stats Services
export const emailStatsService = {
  getLogs: (params) => api.get('/v2/get-email-logs', { params }),
  getAnalytics: () => api.get('/v2/email-analytics'),
};

// AI Services
export const aiService = {
  generateEmail: (data) => api.post('/ai/generate-email', data),
};

export default api;
