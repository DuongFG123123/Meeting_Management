// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import PublicLayout from "./layouts/PublicLayout";

// Public Pages
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import RoomsPage from "./pages/admin/RoomsPage";
import DevicesPage from "./pages/admin/DevicesPage";
import ReportsPage from "./pages/admin/ReportsPage";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
// TODO: Tạo các trang sau:
// import MyMeetingsPage from "./pages/user/MyMeetingsPage";
// import CreateMeetingPage from "./pages/user/CreateMeetingPage";
// import UserRoomsPage from "./pages/user/UserRoomsPage";
// import HistoryPage from "./pages/user/HistoryPage";
// import ProfilePage from "./pages/user/ProfilePage";

// Guards
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminOnlyRoute from "./routes/AdminOnlyRoute";

export default function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* ===== 1️⃣ PUBLIC ROUTES ===== */}
      <Route element={<PublicLayout />}>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/forgot-password"
          element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" replace />}
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* ===== 2️⃣ ADMIN ROUTES (Chỉ cho ROLE_ADMIN) ===== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminOnlyRoute>
              <AdminLayout />
            </AdminOnlyRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      {/* ===== 3️⃣ USER ROUTES (Cho tất cả user đã đăng nhập) ===== */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        {/* TODO: Uncomment khi đã tạo các trang */}
        {/* <Route path="my-meetings" element={<MyMeetingsPage />} /> */}
        {/* <Route path="create-meeting" element={<CreateMeetingPage />} /> */}
        {/* <Route path="rooms" element={<UserRoomsPage />} /> */}
        {/* <Route path="history" element={<HistoryPage />} /> */}
        {/* <Route path="profile" element={<ProfilePage />} /> */}
      </Route>

      {/* ===== 4️⃣ ROOT REDIRECT ===== */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/user" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ===== 5️⃣ 404 REDIRECT ===== */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}