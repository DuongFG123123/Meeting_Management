// src/utils/api.js
import axios from 'axios';

// Đọc biến môi trường theo chuẩn của VITE
const API_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_URL) {
  console.error("VITE_BACKEND_URL is not defined! Check your .env file.");
}

const api = axios.create({
  baseURL: API_URL,
});

/**
 * Interceptor (Bộ chặn)
 * Tự động thêm "Authorization: Bearer <token>"
 * vào TẤT CẢ các request API
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Chỉ thêm token nếu tồn tại VÀ request không phải là trang login/register
    if (token && !config.url.includes('/auth/')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;