// src/routes/AdminOnlyRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/user/dashboard" replace />;

  return children;
};

export default AdminOnlyRoute;
