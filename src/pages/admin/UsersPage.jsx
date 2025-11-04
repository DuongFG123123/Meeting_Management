// src/pages/admin/UsersPage.jsx
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import api from "../../utils/api"; // Import Axios đã cấu hình

// (Component Modal - Giữ nguyên logic UI của bạn)
const Modal = ({ children, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default function UsersPage() {
  const [users, setUsers] = useState([]); // Dữ liệu thật từ API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // State cho form (Khớp với AdminUserUpdateRequest DTO)
  const [formData, setFormData] = useState({ 
    roles: ["ROLE_USER"], 
    isActive: true 
  });

  // --- 1. LẤY DỮ LIỆU TỪ BACKEND (US-19) ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/users");
        setUsers(response.data);
        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []); // Chạy 1 lần khi component tải

  // --- 2. XỬ LÝ NGHIỆP VỤ (Update, Create, Delete) ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingUser) {
      // CẬP NHẬT USER (US-18)
      try {
        const response = await api.put(`/admin/users/${editingUser.id}`, {
          roles: formData.roles,
          isActive: formData.isActive,
        });
        // Cập nhật state (giao diện)
        setUsers(users.map(u => u.id === editingUser.id ? response.data : u));
        closeModal();
      } catch (err) {
        setError("Lỗi khi cập nhật user.");
        console.error(err);
      }
    } else {
      // TẠO USER MỚI (Cần API `POST /admin/users` riêng)
      // Hiện tại chúng ta dùng API /register (chỉ cần Admin)
      console.log("Đang tạo user...", formData);
      // try {
      //   const response = await api.post("/auth/register", {
      //     username: formData.username,
      //     password: "DefaultPassword123", // Admin đặt pass mặc định
      //     fullName: formData.fullName,
      //   });
      //   setUsers([...users, response.data]); // (API /register cần trả về User)
      //   closeModal();
      // } catch (err) {
      //   setError("Lỗi khi tạo user.");
      // }
    }
  };
  
  // (Chúng ta chưa làm API DELETE user, sẽ làm sau)
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc muốn xóa user này?")) {
      console.log("Xóa user:", userId);
      // await api.delete(`/admin/users/${userId}`);
      // setUsers(users.filter(u => u.id !== userId));
    }
  };

  // --- 3. HÀM MỞ/ĐÓNG MODAL ---

  const openModal = (user = null) => {
    if (user) {
      // Sửa (Edit)
      setEditingUser(user);
      setFormData({ 
        roles: user.roles, 
        isActive: user.isActive 
      });
    } else {
      // Tạo mới (Create)
      setEditingUser(null);
      setFormData({ 
        fullName: "", 
        username: "", 
        roles: ["ROLE_USER"], 
        isActive: true 
      });
    }
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Quản lý Người dùng
        </h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          <FiPlus />
          Thêm mới
        </button>
      </div>

      {/* Bảng dữ liệu thật */}
      <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Họ Tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email (Username)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quyền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${user.roles.includes('ROLE_ADMIN') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.roles.join(', ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-4">
                  <button onClick={() => openModal(user)} className="text-blue-500 hover:text-blue-700">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal (Giữ nguyên UI của bạn) */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold dark:text-white">
              {editingUser ? "Cập nhật User" : "Tạo User mới"}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
              <FiX />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Nếu là Tạo mới, hiển thị các trường này */}
            {!editingUser && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Họ Tên</label>
                  <input type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-900 rounded-xl px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email (Username)</label>
                  <input type="email"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-900 rounded-xl px-3 py-2"
                  />
                </div>
              </>
            )}

            {/* Nếu là Sửa, chỉ hiển thị 2 trường này */}
            {editingUser && (
              <div className="mb-4">
                <h4 className="font-medium dark:text-white">{editingUser.fullName}</h4>
                <p className="text-sm text-gray-500">{editingUser.username}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Quyền (Roles)</label>
              {/* (Đây là UI đơn giản, bạn có thể dùng Checkbox) */}
              <select
                value={formData.roles[0] || 'ROLE_USER'}
                onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
                className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-900 rounded-xl px-3 py-2"
              >
                <option value="ROLE_USER">User</option>
                <option value="ROLE_ADMIN">Admin</option>
                <option value="ROLE_VIP">VIP</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Trạng thái</label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-900 rounded-xl px-3 py-2"
              >
                <option value="true">Hoạt động</option>
                <option value="false">Vô hiệu hóa</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white"
              >
                {editingUser ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}