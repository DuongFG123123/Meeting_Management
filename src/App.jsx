// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import DevicesPage from "./pages/admin/DevicesPage";
import ReportsPage from "./pages/admin/ReportsPage";
// import UserDashboard from "./pages/user/UserDashboard"; // (Trang cho User)

// Guards (Gác cổng)
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminOnlyRoute from "./routes/AdminOnlyRoute";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* === 1. PUBLIC ROUTES (Login, Forgot Password) === */}
      {/* Các route này dùng PublicLayout (không có Sidebar) */}
      <Route element={<PublicLayout />}>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/forgot-password" 
          element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" />} 
        />
        {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
      </Route>

      {/* === 2. PRIVATE ROUTES (Yêu cầu đăng nhập) === */}
      {/* Các route này dùng AdminLayout (có Sidebar/Navbar) */}
      <Route 
        path="/" // Đặt đường dẫn cha là "/"
        element={
          <ProtectedRoute> {/* Gác cổng 1: Phải đăng nhập */}
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* --- 2a. ADMIN Routes (Yêu cầu ROLE_ADMIN) --- */}
        {/* Các route này lồng trong AdminOnlyRoute */}
        <Route element={<AdminOnlyRoute />}>
          {/* SỬA LỖI: Bỏ dấu / ở đầu */}
          <Route path="admin/dashboard" element={<DashboardPage />} />
          <Route path="admin/users" element={<UsersPage />} />
          <Route path="admin/devices" element={<DevicesPage />} />
          <Route path="admin/reports" element={<ReportsPage />} />
          
          {/* Đặt trang dashboard admin làm trang chủ */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* --- 2b. USER Routes (Ví dụ) --- */}
        {/* (Chúng ta sẽ làm trang User sau) */}
        {/* <Route path="user/dashboard" element={<UserDashboard />} /> */}
        {/* <Route path="my-meetings" element={<MyMeetingsPage />} /> */}
        
        {/* Trang mặc định (nếu chỉ vào "/") */}
        {/* <Route index element={<Navigate to="/user/dashboard" replace />} /> */}

      </Route>

    </Routes>
  );
}