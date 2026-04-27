import axios from 'axios';

// ─── PRODUCTION FIX ───────────────────────────────────────────────────────────
// On Vercel, the "proxy" in package.json does NOT work — it only works locally.
// In production, REACT_APP_API_URL must be set as a Vercel environment variable
// pointing to your Railway backend URL, e.g.:
//   REACT_APP_API_URL = https://your-app.up.railway.app/api
//
// Locally, it falls back to http://localhost:5000/api
// ─────────────────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 90000, // 90 seconds for file uploads
});

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('pp_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Handle 401 globally — clear storage and redirect to login
api.interceptors.response.use(
  response => response,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
