import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
});

export const dashboardService = {
  getMetrics: () => api.get('/dashboard/metrics/'),
  getProjects: (params) => api.get('/projects/', { params }),
  importFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/projects/import_file/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  clearAll: () => api.delete('/projects/clear_all/'),
};

export default api;
