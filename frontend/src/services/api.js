import axios from 'axios';
import { auth } from './firebaseConfig';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get the current Firebase ID token for authenticated requests
 */
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

/**
 * Create an axios instance with auth headers automatically attached
 */
const authAxios = async () => {
  const token = await getAuthToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

// ─── Auth Service ────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Fetch user role from Firestore via backend after Firebase client login
   */
  getUserRole: async (uid) => {
    const instance = await authAxios();
    return instance.post('/auth/login', { uid });
  },

  signup: async (email, password, name) => {
    return axios.post(`${API_BASE_URL}/auth/signup`, { email, password, name });
  },

  logout: async (uid) => {
    const instance = await authAxios();
    return instance.post('/auth/logout', { uid });
  },

  forgotPassword: async (email) => {
    return axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
  },

  verifyEmail: async (email) => {
    return axios.post(`${API_BASE_URL}/auth/verify-email`, { email });
  }
};

// ─── Volunteer Service ────────────────────────────────────────────────────────

export const volunteerService = {
  register: async (volunteerData) => {
    return axios.post(`${API_BASE_URL}/volunteers`, volunteerData);
  },

  getAll: async () => {
    const instance = await authAxios();
    return instance.get('/volunteers');
  },

  getById: async (id) => {
    const instance = await authAxios();
    return instance.get(`/volunteers/${id}`);
  },

  update: async (id, volunteerData) => {
    const instance = await authAxios();
    return instance.put(`/volunteers/${id}`, volunteerData);
  },

  delete: async (id) => {
    const instance = await authAxios();
    return instance.delete(`/volunteers/${id}`);
  },

  search: async (query, filters) => {
    const instance = await authAxios();
    return instance.get('/volunteers/search/query', {
      params: { query, ...filters }
    });
  }
};

// ─── Admin Service ────────────────────────────────────────────────────────────

export const adminService = {
  getDashboardStats: async () => {
    const instance = await authAxios();
    return instance.get('/admin/dashboard');
  },

  getAllVolunteers: async (filters) => {
    const instance = await authAxios();
    return instance.get('/admin/volunteers', { params: filters });
  },

  approveVolunteer: async (id, notes) => {
    const instance = await authAxios();
    return instance.post(`/admin/volunteers/${id}/approve`, { notes });
  },

  rejectVolunteer: async (id, reason) => {
    const instance = await authAxios();
    return instance.post(`/admin/volunteers/${id}/reject`, { reason });
  },

  updateVolunteer: async (id, volunteerData) => {
    const instance = await authAxios();
    return instance.put(`/admin/volunteers/${id}`, volunteerData);
  },

  deleteVolunteer: async (id) => {
    const instance = await authAxios();
    return instance.delete(`/admin/volunteers/${id}`);
  },

  assignProject: async (volunteerId, projectId, role) => {
    const instance = await authAxios();
    return instance.post('/admin/assign-project', { volunteerId, projectId, role });
  }
};

// ─── Report Service ────────────────────────────────────────────────────────────

export const reportService = {
  getVolunteerReport: async (filters) => {
    const instance = await authAxios();
    return instance.get('/reports/volunteers', { params: filters });
  },

  getActivityReport: async (filters) => {
    const instance = await authAxios();
    return instance.get('/reports/activities', { params: filters });
  },

  getStatistics: async () => {
    const instance = await authAxios();
    return instance.get('/reports/statistics');
  },

  exportCSV: async (filters) => {
    const token = await getAuthToken();
    return axios.get(`${API_BASE_URL}/reports/export-csv`, {
      params: filters,
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  exportPDF: async (filters) => {
    const token = await getAuthToken();
    return axios.get(`${API_BASE_URL}/reports/export-pdf`, {
      params: filters,
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }
};

const api = {
  authService,
  volunteerService,
  adminService,
  reportService
};

export default api;
