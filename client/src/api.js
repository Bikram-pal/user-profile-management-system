import axios from 'axios';

export const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/+$/, '');
const api = axios.create({ baseURL: `${BASE}/api` });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const errMsg = (e) => e.response?.data?.message || e.message;
export default api;
