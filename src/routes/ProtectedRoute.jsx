// src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, đá về trang /login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;