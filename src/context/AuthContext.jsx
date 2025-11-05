import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../services/authService";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔁 Load từ localStorage khi refresh trang (fix lỗi parse)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.warn("⚠️ Lỗi parse user từ localStorage:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // 🟢 Hàm login
  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(username, password);

      // ✅ Backend trả về { accessToken, tokenType }
      const { accessToken, tokenType } = res.data;
      const fullToken = `${tokenType} ${accessToken}`;

      // Lưu token
      localStorage.setItem("token", fullToken);
      setToken(fullToken);

      // ⚙️ Gọi thêm API lấy thông tin user nếu backend có
      let userInfo = null;
      try {
        // ✅ Nếu backend có /api/v1/admin/users/me hoặc /api/v1/users/me thì thay URL tại đây
        const userRes = await api.get("/api/v1/admin/users/me");
        userInfo = userRes.data;
      } catch {
        // Nếu backend chưa có endpoint /me thì mock tạm user
        userInfo = { username, role: "ADMIN" };
      }

      // Lưu user
      localStorage.setItem("user", JSON.stringify(userInfo));
      setUser(userInfo);

      // ✅ Điều hướng theo role
      if (userInfo.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error; // để LoginPage hiển thị lỗi đẹp
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Logout
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  // 🧩 Helper state
  const isAuthenticated = !!token;
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isAdmin, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
