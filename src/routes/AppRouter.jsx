// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import PublicLayout from "../layouts/PublicLayout";

// Public Pages
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
// import ResetPasswordPage from "../pages/ResetPasswordPage";

// Admin Pages (Đảm bảo đường dẫn import đúng)
import Dashboard from "../pages/admin/DashboardPage";
import Users from "../pages/admin/UsersPage";
import Rooms from "../pages/admin/RoomsPage"; // (Bạn thiếu import này)
import Devices from "../pages/admin/DevicesPage";
import Reports from "../pages/admin/ReportsPage";
// import UserDashboard from "../pages/user/UserDashboard"; // (Trang cho User)

// Guards
import ProtectedRoute from "./ProtectedRoute";
import AdminOnlyRoute from "./AdminOnlyRoute";

export default function AppRouter() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* === 1. PUBLIC ROUTES (Login, Forgot Password) === */}
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
            {/* SỬA LỖI: Bỏ dấu / ở đầu. Các path này là "tương đối" với cha */}
            <Route path="admin/dashboard" element={<Dashboard />} /> 
            <Route path="admin/users" element={<Users />} />
            <Route path="admin/rooms" element={<Rooms />} /> {/* (Thêm route Rooms) */}
            <Route path="admin/devices" element={<Devices />} />
            <Route path="admin/reports" element={<Reports />} />
          </Route>

          {/* --- 2b. USER Routes (Ví dụ) --- */}
          {/* <Route path="user/dashboard" element={<UserDashboard />} /> */}
          {/* <Route path="my-meetings" element={<MyMeetingsPage />} /> */}
          
          {/* --- Trang mặc định (Home Page) --- */}
          <Route 
            index // Đây là trang mặc định cho "/"
            element={
              // Tùy vào vai trò, điều hướng họ đến đúng dashboard
              isAdmin ? 
              <Navigate to="/admin/dashboard" replace /> : // Admin default
              <Navigate to="/my-meetings" replace />   // User default (ví dụ)
            } 
          />
        </Route>
        
        {/* Bất kỳ URL nào không khớp */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />

      </Routes>
    </BrowserRouter>
  );
}