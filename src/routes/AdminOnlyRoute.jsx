// src/routes/AdminOnlyRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminOnlyRoute = () => {
  const { isAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, điều hướng về trang login
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Nếu không phải admin (ví dụ user thường) → đá về dashboard user
    return <Navigate to="/user/dashboard" replace />;
  }

  // Nếu là admin → hiển thị các route con
  return <Outlet />;
};

export default AdminOnlyRoute;
