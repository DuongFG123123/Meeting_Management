// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../services/authService'; // (Giữ nguyên)
import api from '../utils/api'; // (Giữ nguyên)
import { jwtDecode } from 'jwt-decode'; // <-- BỔ SUNG

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Chỉ lưu thông tin đã giải mã
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Đổi: Bắt đầu = true

  // 🔁 Giữ đăng nhập khi reload trang (Logic MỚI)
  useEffect(() => {
    if (token) {
      try {
        // 1. Giải mã token
        const decodedToken = jwtDecode(token);
        
        // 2. Kiểm tra token hết hạn chưa
        const isExpired = decodedToken.exp * 1000 < Date.now();

        if (isExpired) {
          console.warn("Token đã hết hạn, đang đăng xuất.");
          logout(); // Hết hạn -> Đăng xuất
        } else {
          // 3. Set token vào axios header cho các request sau
          api.defaults.headers.common['Authorization'] = `${token}`;
          
          // 4. Set thông tin user TỪ TOKEN (Nguồn chân lý)
          setUser({
            id: decodedToken.userId, // (Từ claim "userId")
            username: decodedToken.sub, // (Từ claim "sub" - subject)
            roles: decodedToken.roles || [], // (Từ claim "roles")
          });
        }
      } catch (error) {
        console.error("Token không hợp lệ hoặc bị hỏng:", error);
        logout(); // Token lỗi -> Đăng xuất
      }
    }
    setLoading(false); // Hoàn tất kiểm tra
  }, [token, navigate]); // Thêm navigate vào dependency

  // 🟢 Hàm login (ĐƠN GIẢN HÓA)
  const login = async (username, password) => {
    setLoading(true);
    try {
      // 1️⃣ Gọi API login lấy token (CHỈ CẦN 1 API)
      const res = await authApi.login(username, password);
      const { accessToken, tokenType } = res.data;
      const fullToken = `${tokenType} ${accessToken}`;

      // 2️⃣ Lưu token vào localStorage và State
      // (useEffect ở trên sẽ tự động chạy và giải mã token)
      localStorage.setItem('token', fullToken);
      setToken(fullToken);

      // 3️⃣ Giải mã ngay để điều hướng
      const decodedToken = jwtDecode(fullToken);
      const roles = decodedToken.roles || [];
      
      if (roles.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else {
        navigate('/user'); // (Hoặc trang '/' tùy bạn)
      }

    } catch (error) {
      console.error("❌ Login failed:", error);
      // Ném lỗi ra để LoginPage.jsx có thể bắt và hiển thị
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Logout
  const logout = () => {
    localStorage.removeItem('token');
    // BỎ: localStorage.removeItem('user'); (Không cần nữa)
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  // 🔎 Helper
  const isAuthenticated = !!token;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  // Chờ check token xong mới render
  if (loading) {
    return <div>Đang tải ứng dụng...</div>; // Hoặc 1 spinner toàn trang
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