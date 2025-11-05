import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_URL) {
  console.error("❌ VITE_BACKEND_URL is not defined! Check your .env file.");
}

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !config.url.includes("/auth/")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
