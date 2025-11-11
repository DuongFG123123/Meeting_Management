// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, điều hướng về /login
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, cho phép hiển thị nội dung bên trong
  return children;
};

export default ProtectedRoute;
