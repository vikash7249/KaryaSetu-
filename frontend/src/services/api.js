import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ks_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || 'Something went wrong';
    if (err.response?.status === 401) {
      localStorage.removeItem('ks_token');
      window.location.href = '/login';
    } else if (err.response?.status !== 422) {
      toast.error(msg);
    }
    return Promise.reject(err.response?.data || err);
  }
);

export const authAPI = {
  register:       (d) => api.post('/auth/register', d),
  login:          (d) => api.post('/auth/login', d),
  getMe:          ()  => api.get('/auth/me'),
  updateProfile:  (d) => api.put('/auth/profile', d),
  changePassword: (d) => api.put('/auth/change-password', d),
  inviteUser:     (d) => api.post('/auth/invite', d),
  acceptInvite:   (token, d) => api.post(`/auth/accept-invite/${token}`, d),
};

export const projectsAPI = {
  getAll:  (p) => api.get('/projects', { params: p }),
  getOne:  (id) => api.get(`/projects/${id}`),
  create:  (d)  => api.post('/projects', d),
  update:  (id, d) => api.put(`/projects/${id}`, d),
  delete:  (id) => api.delete(`/projects/${id}`),
  archive: (id) => api.put(`/projects/${id}/archive`),
};

export const tasksAPI = {
  getAll:       (p)    => api.get('/tasks', { params: p }),
  getOne:       (id)   => api.get(`/tasks/${id}`),
  create:       (d)    => api.post('/tasks', d),
  update:       (id,d) => api.put(`/tasks/${id}`, d),
  delete:       (id)   => api.delete(`/tasks/${id}`),
  updateStatus: (id,s) => api.patch(`/tasks/${id}/status`, { status: s }),
  addComment:   (id,t) => api.post(`/tasks/${id}/comments`, { text: t }),
};

export const usersAPI = {
  getTeam:       ()   => api.get('/users/team'),
  getOne:        (id) => api.get(`/users/${id}`),
  update:        (id,d) => api.put(`/users/${id}`, d),
  deactivate:    (id) => api.put(`/users/${id}/deactivate`),
  getInvitations: ()  => api.get('/users/invitations'),
};

export const notificationsAPI = {
  getAll:        () => api.get('/notifications'),
  markRead:      (id) => api.put(`/notifications/${id}/read`),
  markAllRead:   () => api.put('/notifications/read-all'),
  getUnreadCount:() => api.get('/notifications/unread-count'),
};

export const aiAPI = {
  chat:        (msgs) => api.post('/ai/chat', { messages: msgs }),
  planProject: (p)    => api.post('/ai/plan-project', { prompt: p }),
  workload:    ()     => api.get('/ai/workload'),
};

export const analyticsAPI = {
  getDashboard:   () => api.get('/analytics/dashboard'),
  getProductivity:() => api.get('/analytics/productivity'),
};

export const adminAPI = {
  getStats:     () => api.get('/admin/stats'),
  getCompanies: () => api.get('/admin/companies'),
  updateCompany:(id,d) => api.put(`/admin/companies/${id}`, d),
  toggleCompany:(id)   => api.put(`/admin/companies/${id}/toggle`),
};

export const filesAPI = {
  getAll:   (params) => api.get('/files', { params }),
  upload:   (formData) => api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:   (id)    => api.delete(`/files/${id}`),
  download: (id)    => `/api/files/${id}/download`,
};

export const timelogsAPI = {
  start:      (taskId) => api.post('/timelogs/start', { taskId }),
  stop:       (note)   => api.post('/timelogs/stop', { note }),
  getAll:     (params) => api.get('/timelogs', { params }),
  getRunning: ()       => api.get('/timelogs/running'),
};

export const activityAPI = {
  getAll: (params) => api.get('/activitylogs', { params }),
};

export default api;
