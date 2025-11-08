// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ===== Layouts =====
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import PublicLayout from "../layouts/PublicLayout";

// ===== Public Pages =====
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

// ===== User Pages =====
import UserDashboard from "../pages/user/UserDashboard";
import MyMeetingsPage from "../pages/user/MyMeetingsPage";
import CreateMeetingPage from "../pages/user/CreateMeetingPage";
import UserRoomsPage from "../pages/user/UserRoomsPage";
import HistoryPage from "../pages/user/HistoryPage";
import ProfilePage from "../pages/user/ProfilePage";

export default function AppRouter() {
  const { isAuthenticated } = useAuth();

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

      {/* === 2. ADMIN ROUTES === */}
      <Route path="/admin/*" element={<AdminLayout />} />

      {/* === 3. USER ROUTES (Nested with children) === */}
      <Route path="/user" element={<UserLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="my-meetings" element={<MyMeetingsPage />} />
        <Route path="create-meeting" element={<CreateMeetingPage />} />
        <Route path="rooms" element={<UserRoomsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* === 4. CATCH-ALL (404 Redirect) === */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/user/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
