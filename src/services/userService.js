// src/services/userService.js
import api from "../utils/api";

// ✅ Lấy danh sách tất cả người dùng (Admin only)
export const getAllUsers = () => api.get("/admin/users");

// ✅ Cập nhật vai trò hoặc trạng thái user
export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data); 
// data mẫu: { roles: ["ROLE_USER"], isActive: true }

// ✅ Xóa người dùng (Admin only)
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// ✅ Tạo mới người dùng (Admin only)
export const createUser = (data) => api.post("/auth/register", data);
// data mẫu: { username, password, fullName }
