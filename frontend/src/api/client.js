// src/api/client.js
import axios from 'axios';

// Dynamically determine the backend URL based on whether user is accessing via localhost or network IP (e.g., from mobile)
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = window.location.hostname;
  return `http://${hostname}:8000`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

// Request interceptor to add X-School-Id header if present in localStorage
api.interceptors.request.use((config) => {
  const schoolId = localStorage.getItem('spms_school_id') || localStorage.getItem('schoolId');
  if (schoolId) {
    config.headers['X-School-Id'] = schoolId;
  }
  return config;
});

// Response interceptor to handle token refresh if 401 occurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${getApiBaseUrl()}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        return api(originalRequest);
      } catch (refreshErr) {
        // If refresh fails, clear credentials
        localStorage.removeItem('spms_user');
        localStorage.removeItem('spms_school_id');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
