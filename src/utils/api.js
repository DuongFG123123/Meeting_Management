// src/utils/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_URL) {
  console.error("❌ VITE_BACKEND_URL is not defined! Check your .env file.");
}

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// === 🎯 LOGIC ĐÃ SỬA LỖI ===

// 1. Liệt kê các route public (không cần token)
const PUBLIC_AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  // Thêm các route public khác nếu có
];

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // 2. Kiểm tra xem đây có phải là route public không
    const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) =>
      config.url.endsWith(route)
    );

    // 3. Logic mới:
    // Nếu có token VÀ route này KHÔNG PHẢI là route public
    if (token && !isPublicAuthRoute) {
      // Thì đính kèm token
      config.headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    } else {
      // Ngược lại (không có token, hoặc đây là route public)
      // thì xóa token (để đảm bảo an toàn cho route login/register)
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;