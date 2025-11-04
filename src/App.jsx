import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import DevicesPage from "./pages/admin/DevicesPage";
import ReportsPage from "./pages/admin/ReportsPage";
import UserDashboard from "./pages/user/UserDashboard";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Routes>
      {/* Đăng nhập */}
      <Route path="/login" element={<LoginPage />} />

      {/* ADMIN */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute requiredRole="admin">
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      {/* USER */}
      <Route
        path="/user"
        element={
          <PrivateRoute requiredRole="user">
            <UserDashboard />
          </PrivateRoute>
        }
      />

      {/* Mặc định */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
