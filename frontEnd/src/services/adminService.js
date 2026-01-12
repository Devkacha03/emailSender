import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// ==================== DASHBOARD ====================
export const getDashboardStats = () => {
  return axios.get(`${API_URL}/admin/dashboard`, {
    headers: getAuthHeader(),
  });
};

// ==================== EMAIL MANAGEMENT ====================
export const getAllEmails = (params) => {
  return axios.get(`${API_URL}/admin/emails`, {
    headers: getAuthHeader(),
    params,
  });
};

export const getEmailDetails = (id) => {
  return axios.get(`${API_URL}/admin/emails/${id}`, {
    headers: getAuthHeader(),
  });
};

export const deleteEmail = (id) => {
  return axios.delete(`${API_URL}/admin/emails/${id}`, {
    headers: getAuthHeader(),
  });
};

// ==================== USER MANAGEMENT ====================
export const getAllUsers = (params) => {
  return axios.get(`${API_URL}/admin/users`, {
    headers: getAuthHeader(),
    params,
  });
};

export const getUserDetails = (id) => {
  return axios.get(`${API_URL}/admin/users/${id}`, {
    headers: getAuthHeader(),
  });
};

export const updateUserRole = (id, role) => {
  return axios.patch(
    `${API_URL}/admin/users/${id}/role`,
    { role },
    { headers: getAuthHeader() }
  );
};

export const toggleUserStatus = (id) => {
  return axios.patch(
    `${API_URL}/admin/users/${id}/toggle-status`,
    {},
    { headers: getAuthHeader() }
  );
};

export const deleteUser = (id) => {
  return axios.delete(`${API_URL}/admin/users/${id}`, {
    headers: getAuthHeader(),
  });
};

// ==================== TEMPLATE MANAGEMENT ====================
export const getAllTemplates = (params) => {
  return axios.get(`${API_URL}/admin/templates`, {
    headers: getAuthHeader(),
    params,
  });
};

export const getTemplateDetails = (id) => {
  return axios.get(`${API_URL}/admin/templates/${id}`, {
    headers: getAuthHeader(),
  });
};

export const createTemplate = (data) => {
  return axios.post(`${API_URL}/admin/templates`, data, {
    headers: getAuthHeader(),
  });
};

export const updateTemplate = (id, data) => {
  return axios.put(`${API_URL}/admin/templates/${id}`, data, {
    headers: getAuthHeader(),
  });
};

export const deleteTemplate = (id) => {
  return axios.delete(`${API_URL}/admin/templates/${id}`, {
    headers: getAuthHeader(),
  });
};

// ==================== ANALYTICS ====================
export const getAnalytics = (params) => {
  return axios.get(`${API_URL}/admin/analytics`, {
    headers: getAuthHeader(),
    params,
  });
};

// ==================== SETTINGS ====================
export const getSettings = () => {
  return axios.get(`${API_URL}/admin/settings`, {
    headers: getAuthHeader(),
  });
};

export const updateSettings = (data) => {
  return axios.put(`${API_URL}/admin/settings`, data, {
    headers: getAuthHeader(),
  });
};

// ==================== SYSTEM MONITORING ====================
export const getSystemMonitoring = () => {
  return axios.get(`${API_URL}/admin/monitoring`, {
    headers: getAuthHeader(),
  });
};

// ==================== EMAIL QUEUE ====================
export const getEmailQueue = (params) => {
  return axios.get(`${API_URL}/admin/queue`, {
    headers: getAuthHeader(),
    params,
  });
};

export const retryFailedEmail = (id) => {
  return axios.post(`${API_URL}/admin/emails/${id}/retry`, {}, {
    headers: getAuthHeader(),
  });
};

export const cancelQueuedEmail = (id) => {
  return axios.patch(`${API_URL}/admin/queue/${id}/cancel`, {}, {
    headers: getAuthHeader(),
  });
};

// ==================== AUDIT LOGS ====================
export const getAuditLogs = (params) => {
  return axios.get(`${API_URL}/admin/audit-logs`, {
    headers: getAuthHeader(),
    params,
  });
};

// ==================== USER QUOTA ====================
export const updateUserQuota = (id, quotaData) => {
  return axios.patch(`${API_URL}/admin/users/${id}/quota`, quotaData, {
    headers: getAuthHeader(),
  });
};

export const resetUserQuota = (id) => {
  return axios.post(`${API_URL}/admin/users/${id}/quota/reset`, {}, {
    headers: getAuthHeader(),
  });
};

// ==================== EMAIL PROVIDER TESTING ====================
export const testEmailProvider = (data) => {
  return axios.post(`${API_URL}/admin/test-email-provider`, data, {
    headers: getAuthHeader(),
  });
};

// ==================== EXPORT REPORTS ====================
export const exportReport = (params) => {
  return axios.get(`${API_URL}/admin/export`, {
    headers: getAuthHeader(),
    params,
    responseType: params.format === 'csv' ? 'blob' : 'json',
  });
};

const adminService = {
  getDashboardStats,
  getAllEmails,
  getEmailDetails,
  deleteEmail,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllTemplates,
  getTemplateDetails,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAnalytics,
  getSettings,
  updateSettings,
  getSystemMonitoring,
  getEmailQueue,
  retryFailedEmail,
  cancelQueuedEmail,
  getAuditLogs,
  updateUserQuota,
  resetUserQuota,
  testEmailProvider,
  exportReport,
};

export default adminService;
