// src/routes/AdminOnlyRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminOnlyRoute = () => {
  const { isAdmin, isAuthenticated } = useAuth(); // Thêm check isAuthenticated

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Nếu là User, đá về trang chủ (hoặc trang 403)
    return <Navigate to="/" replace />;
  }

  // Nếu là Admin, cho phép hiển thị các route con
  return <Outlet />; 
};

export default AdminOnlyRoute;