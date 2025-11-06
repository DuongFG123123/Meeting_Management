// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ===== Layouts =====
import AdminLayout from "../layouts/AdminLayout";
import PublicLayout from "../layouts/PublicLayout";

// ===== Public Pages =====
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

// ===== Admin Pages =====
import Dashboard from "../pages/admin/DashboardPage";
import Users from "../pages/admin/UsersPage";
import Rooms from "../pages/admin/RoomsPage";
import Devices from "../pages/admin/DevicesPage";
import Reports from "../pages/admin/ReportsPage";

// ===== User Pages =====
import UserDashboard from "../pages/user/UserDashboard";
// import MyMeetingsPage from "../pages/user/MyMeetingsPage";

// ===== Guards =====
import ProtectedRoute from "./ProtectedRoute";
import AdminOnlyRoute from "./AdminOnlyRoute";

export default function AppRouter() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* === 1. PUBLIC ROUTES (Login, Forgot Password) === */}
      <Route element={<PublicLayout />}>
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/forgot-password"
          element={
            !isAuthenticated ? (
              <ForgotPasswordPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* === 2. PRIVATE ROUTES (Yêu cầu đăng nhập) === */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* --- 2a. ADMIN Routes (Chỉ cho Admin) --- */}
        <Route element={<AdminOnlyRoute />}>
          <Route path="admin/dashboard" element={<Dashboard />} />
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/rooms" element={<Rooms />} />
          <Route path="admin/devices" element={<Devices />} />
          <Route path="admin/reports" element={<Reports />} />
        </Route>

        {/* --- 2b. USER Routes --- */}
        <Route path="user/dashboard" element={<UserDashboard />} />
        {/* <Route path="user/my-meetings" element={<MyMeetingsPage />} /> */}

        {/* --- 2c. TRANG MẶC ĐỊNH --- */}
        <Route
          index
          element={
            isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/user/dashboard" replace />
            )
          }
        />
      </Route>

      {/* === 3. CATCH-ALL (404 Redirect) === */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
