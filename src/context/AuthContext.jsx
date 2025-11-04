// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Cài đặt: npm install jwt-decode
import api from '../utils/api'; // Import axios đã cấu hình

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu thông tin (id, username, roles)
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Đang check token khi tải trang

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const isExpired = decodedToken.exp * 1000 < Date.now();

        if (isExpired) {
          logout();
        } else {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser({
            id: decodedToken.sub, // 'sub' (subject) là ID user
            username: decodedToken.username,
            roles: decodedToken.roles || [], // (Backend cần thêm 'roles' vào token)
          });
        }
      } catch (error) {
        console.error("Invalid token", error);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.roles.includes('ROLE_ADMIN');

  if (loading) {
    return <div>Loading application...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);