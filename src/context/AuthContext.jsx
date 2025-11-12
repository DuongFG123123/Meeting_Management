import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../services/authService";
import api from "../utils/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [initializing, setInitializing] = useState(true); // ✅ Chỉ dùng khi check token ban đầu (hết nháy)
  const [loading, setLoading] = useState(false); // ✅ Loading riêng cho hành động login

  // 🔁 Giữ đăng nhập khi reload trang
  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const expired = decoded.exp * 1000 < Date.now();

      if (expired) {
        console.warn("Token hết hạn, đăng xuất im lặng");
        logout(true);
      } else {
        api.defaults.headers.common["Authorization"] = token;
        setUser({
          id: decoded.userId,
          username: decoded.sub,
          roles: decoded.roles || [],
        });
      }
    } catch (err) {
      console.error("Token không hợp lệ:", err);
      logout(true);
    }

    setInitializing(false);
  }, [token]);

  // 🟢 Login không navigate trong context (để tránh reload)
  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(username, password);
      const { accessToken, tokenType } = res.data;
      const fullToken = `${tokenType} ${accessToken}`;

      localStorage.setItem("token", fullToken);
      setToken(fullToken);

      const decoded = jwtDecode(fullToken);
      setUser({
        id: decoded.userId,
        username: decoded.sub,
        roles: decoded.roles || [],
      });

      return decoded.roles || [];
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Logout (thêm chế độ im lặng)
  const logout = (silent = false) => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common["Authorization"];
    if (!silent) navigate("/login");
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  // ⏳ Chỉ hiển thị “Đang tải...” khi khởi tạo app, không khi login
  if (initializing) {
    return <div>Đang tải ứng dụng...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
