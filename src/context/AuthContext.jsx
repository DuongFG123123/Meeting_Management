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

  // 🔁 Giữ đăng nhập khi reload trang
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) setToken(storedToken);

    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // 🟢 Hàm login
  const login = async (username, password) => {
    setLoading(true);
    try {
      // 1️⃣ Gọi API login lấy token
      const res = await authApi.login(username, password);
      const { accessToken, tokenType } = res.data;
      const fullToken = `${tokenType} ${accessToken}`;

      localStorage.setItem("token", fullToken);
      setToken(fullToken);

      // 2️⃣ Gọi API lấy thông tin user bằng email
      // ✅ Tùy backend, nếu không có /me, dùng /admin/users/{id}
      let userInfo = null;

      try {
        // bạn có thể tùy chỉnh id theo user hiện tại nếu backend hỗ trợ lấy từ JWT
        // ví dụ: tạm thời hardcode admin có id = 3 (hoặc lấy từ decode token)
        const userRes = await api.get("/api/v1/admin/users/3"); 
        userInfo = userRes.data;
      } catch (error) {
        console.warn("⚠️ Không thể lấy thông tin user, dùng dữ liệu tạm.");
        userInfo = {
          username,
          fullName: "Admin Mock",
          roles: ["ROLE_ADMIN"],
          active: true,
        };
      }

      localStorage.setItem("user", JSON.stringify(userInfo));
      setUser(userInfo);

      // 3️⃣ Điều hướng theo role
      const role = userInfo.roles?.[0];
      if (role === "ROLE_ADMIN") navigate("/admin/dashboard");
      else navigate("/user/dashboard");
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
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

  // 🔎 Helper
  const isAuthenticated = !!token;
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

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
