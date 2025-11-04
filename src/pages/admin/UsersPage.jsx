import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";

export default function UsersPage() {
  const [users, setUsers] = useState([
    { id: 1, name: "Phuong Anh", email: "phanhl@gmail.com", role: "Admin", registered: "2/11/2025" },
    { id: 2, name: "Chu", email: "chu@gmail.com", role: "Người đặt lịch", registered: "3/11/2025" },
    { id: 3, name: "Duong", email: "duong@gmail.com", role: "Người tham dự", registered: "4/11/2025" },
    { id: 4, name: "Anh", email: "anh@gmail.com", role: "Người tham dự", registered: "4/11/2025" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "Người tham dự" });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // role colors with dark mode
  const roleColor = {
    Admin: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    "Người đặt lịch": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    "Người tham dự": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  };

  // dark mode watcher
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // filter
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  // pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changePage = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  // CRUD
  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "Người tham dự" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...formData, id: editingUser.id } : u)));
    } else {
      const newUser = { ...formData, id: Date.now(), registered: new Date().toLocaleDateString("vi-VN") };
      setUsers([...users, newUser]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này không?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="p-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tổng cộng {users.length} tài khoản người dùng đã đăng ký
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl 
                     hover:bg-blue-700 hover:shadow dark:bg-blue-500 dark:hover:bg-blue-600 transition-all"
        >
          <FiPlus /> Thêm người dùng
        </button>
      </div>

      {/* Tìm kiếm */}
      <div className="relative mb-5">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-900 
                     rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none 
                     text-gray-800 dark:text-gray-100 transition-colors"
        />
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-700 border-b text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Tên người dùng</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Quyền hạn</th>
              <th className="px-6 py-3">Ngày đăng ký</th>
              <th className="px-6 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  whileHover={{
                    backgroundColor: isDarkMode
                      ? "rgba(51,65,85,0.5)"
                      : "rgba(243,244,246,0.6)",
                  }}
                  transition={{ duration: 0.25 }}
                  className="border-b border-gray-100 dark:border-slate-700 transition-colors"
                >
                  <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{user.id}</td>
                  <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-100">{user.name}</td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${roleColor[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{user.registered}</td>
                  <td className="px-6 py-3 flex gap-2 justify-center">
                    <button
                      onClick={() => openModal(user)}
                      className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 
                                 px-3 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"
                    >
                      <FiEdit2 /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex items-center gap-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 
                                 px-3 py-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-all"
                    >
                      <FiTrash2 /> Xóa
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Không tìm thấy người dùng phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          Trang {currentPage}/{totalPages || 1}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 
                       dark:border-slate-700 disabled:opacity-40 transition"
          >
            ← Trước
          </button>
          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 
                       dark:border-slate-700 disabled:opacity-40 transition"
          >
            Sau →
          </button>
        </div>
      </div>

      {/* Modal thêm/sửa */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-lg border border-gray-100 dark:border-slate-700 transition-colors"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tên người dùng
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-900 
                               rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none 
                               text-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-900 
                               rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none 
                               text-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quyền hạn</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-900 
                               rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none 
                               text-gray-800 dark:text-gray-100"
                  >
                    <option>Admin</option>
                    <option>Người đặt lịch</option>
                    <option>Người tham dự</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 
                               hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 
                               dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition"
                  >
                    {editingUser ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
