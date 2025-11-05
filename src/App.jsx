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
import RoomsPage from "./pages/admin/RoomsPage"; // ✅ Thêm trang Quản lý phòng họp
import DevicesPage from "./pages/admin/DevicesPage";
import ReportsPage from "./pages/admin/ReportsPage";
// import UserDashboard from "./pages/user/UserDashboard"; // (Trang cho User sau này)

// Guards (Gác cổng)
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminOnlyRoute from "./routes/AdminOnlyRoute";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* === 1️⃣ PUBLIC ROUTES (Login, Forgot Password) === */}
      <Route element={<PublicLayout />}>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/forgot-password"
          element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" />}
        />
      </Route>

      {/* === 2️⃣ PRIVATE ROUTES (Yêu cầu đăng nhập) === */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* --- ADMIN ROUTES (Chỉ cho ROLE_ADMIN) --- */}
        <Route element={<AdminOnlyRoute />}>
          <Route path="admin/dashboard" element={<DashboardPage />} />
          <Route path="admin/users" element={<UsersPage />} />
          <Route path="admin/rooms" element={<RoomsPage />} /> {/* ✅ Quản lý phòng họp */}
          <Route path="admin/devices" element={<DevicesPage />} />
          <Route path="admin/reports" element={<ReportsPage />} />

          {/* Trang mặc định khi vào "/" */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* --- USER ROUTES (để sau) --- */}
        {/* <Route path="user/dashboard" element={<UserDashboard />} /> */}
      </Route>

      {/* === 3️⃣ TRANG MẶC ĐỊNH (404 hoặc điều hướng) === */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
