import { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUser,
  createUser,
  deleteUser,
} from "../../services/userService";
import { toast } from "react-toastify";
import { FiUsers, FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import { Pagination } from "antd";
import "react-toastify/dist/ReactToastify.css";

/* Tuỳ chỉnh màu cho Toast theo theme */
const toastColors = {
  success: "#079830ff", // xanh ngọc dịu
  error: "#ef4444", // đỏ ấm
  warning: "#e4650aff", // vàng dịu
  info: "#3b82f6", // xanh dương nhạt
};

/* ⚙️ Áp dụng màu Toastify */
const setToastTheme = () => {
  const root = document.documentElement;
  root.style.setProperty("--toastify-color-success", toastColors.success);
  root.style.setProperty("--toastify-color-error", toastColors.error);
  root.style.setProperty("--toastify-color-warning", toastColors.warning);
  root.style.setProperty("--toastify-color-info", toastColors.info);
};
setToastTheme();

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // tìm kiếm / lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

  // modal thêm
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    username: "",
    password: "",
    role: "ROLE_USER",
  });

  // modal sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  /* Lấy danh sách người dùng */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      let data = Array.isArray(res.data) ? res.data : res.data.data || [];
      // Sắp xếp giảm dần theo id (user mới nhất lên đầu)
      data = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách:", err);
      toast.error("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* Kiểm tra dữ liệu nhập */
  const validateUserInput = () => {
    if (!newUser.fullName && !newUser.username && !newUser.password) {
      toast.warning("Vui lòng điền đầy đủ thông tin!");
      return false;
    }
    if (!newUser.fullName) {
      toast.warning("Vui lòng nhập Họ và tên!");
      return false;
    }
    if (!newUser.username) {
      toast.warning("Vui lòng nhập Tên người dùng!");
      return false;
    }
    if (!newUser.password) {
      toast.warning("Vui lòng nhập Mật khẩu!");
      return false;
    }
    if (newUser.password.length < 6) {
      toast.warning("Mật khẩu phải có ít nhất 6 ký tự!");
      return false;
    }
    return true;
  };

  /* Tạo người dùng mới */
  const handleCreateUser = async () => {
    if (!validateUserInput()) return;

    try {
      setCreating(true);
      const payload = {
        username: newUser.username,
        password: newUser.password,
        fullName: newUser.fullName,
        roles: [newUser.role], // nếu backend ignore cũng không sao
      };

      const res = await createUser(payload);
      console.log("Đã tạo user:", res.data);

      toast.success("Tạo người dùng thành công!");
      setNewUser({
        fullName: "",
        username: "",
        password: "",
        role: "ROLE_USER",
      });
      setShowAddModal(false);
      fetchUsers();
      // Chèn user mới lên đầu danh sách (không cần reload backend toàn bộ)
      let createdUser = res.data;
      // Nếu backend trả về dạng { data: {...} }
      if (createdUser && createdUser.data) createdUser = createdUser.data;

      // Đảm bảo field roles, active có định dạng chuẩn
      createdUser = {
        ...createdUser,
        roles: createdUser.roles || [payload.roles[0]],
        active:
          typeof createdUser.active === "boolean"
            ? createdUser.active
            : true, // fallback: true nếu backend không trả về (mặc định mới là active)
      };

      setUsers((prev) => [
        { ...createdUser },
        ...prev,
      ]);
    } catch (err) {
      console.error("Lỗi tạo người dùng:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.username ||
        err.response?.data?.password ||
        err.response?.data?.fullName ||
        "Không thể tạo người dùng!";

      if (
        msg.toLowerCase().includes("exists") ||
        msg.toLowerCase().includes("duplicate")
      ) {
        toast.warning("Không thể thêm — dữ liệu này đã tồn tại!");
      } else if (msg.toLowerCase().includes("size")) {
        toast.warning("Mật khẩu phải có ít nhất 6 ký tự!");
      } else {
        toast.error(" " + msg);
      }
    } finally {
      setCreating(false);
    }
  };

  /* Mở modal cập nhật quyền/trạng thái */
  const openEditModal = (user) => {
    setSelectedUser({
      ...user,
      role: user.roles?.[0] || "ROLE_USER",
      active: user.active,
    });
    setShowEditModal(true);
  };

  /* Cập nhật quyền + trạng thái */
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser.id, {
        roles: [selectedUser.role],
        isActive: selectedUser.active,
      });
      toast.success("Cập nhật quyền/trạng thái thành công!");
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi cập nhật người dùng:", err);
      toast.error("Không thể cập nhật quyền/trạng thái!");
    }
  };

  /* Xoá người dùng – giữ nguyên logic toast confirm của bạn */
  const handleDeleteUser = async (id) => {
    if (!id) {
      toast.error("Không xác định được ID người dùng!");
      return;
    }

    const isDark = document.documentElement.classList.contains("dark");

    toast.info(
      <div className="p-5 text-center select-none">
        <div className="flex justify-center items-center gap-3 mb-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              isDark ? "bg-blue-900" : "bg-blue-100"
            }`}
          >
            <FiTrash2
              className={`text-xl ${
                isDark ? "text-blue-300" : "text-blue-600"
              }`}
            />
          </div>
          <h3
            className={`text-lg font-semibold ${
              isDark ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Xác nhận xoá người dùng?
          </h3>
        </div>

        <div className="flex justify-center gap-4 mt-5">
          <button
            onClick={async () => {
              try {
                await deleteUser(id);
                toast.dismiss();
                toast.success("Đã xoá người dùng!");
                setUsers((prev) => prev.filter((u) => u.id !== id));
              } catch (err) {
                console.error("Lỗi khi xoá:", err.response?.data || err);
                toast.dismiss();
                toast.error(
                  err.response?.data?.message ||
                    "Không thể xoá người dùng! Có thể do quyền hoặc ràng buộc dữ liệu."
                );
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            Xoá
          </button>

          <button
            onClick={() => toast.dismiss()}
            className={`font-semibold px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Huỷ
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
        style: {
          background: isDark ? "#1e293b" : "#ffffff",
          color: isDark ? "#e2e8f0" : "#1f2937",
          borderRadius: "14px",
          boxShadow: isDark
            ? "0 6px 25px rgba(0,0,0,0.45)"
            : "0 6px 20px rgba(0,0,0,0.15)",
          minWidth: "360px",
        },
        icon: false,
      }
    );
  };

  /* Lọc người dùng theo search & trạng thái */
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      user.fullName?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term);

    const matchStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? user.active
        : !user.active;

    return matchSearch && matchStatus;
  });

  /* ✨ Cắt danh sách theo trang (sau khi lọc) */
const startIndex = (currentPage - 1) * pageSize;
const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-8 min-h-screen transition-colors bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-2">
          <FiUsers className="text-3xl text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Quản lý người dùng
          </h1>
        </div>
      </motion.div>

      {/* Thanh tìm kiếm + lọc + nút thêm (giống trang thiết bị) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md mb-6 border border-gray-100 dark:border-gray-700 flex flex-col gap-3 md:flex-row md:items-center"
      >
        {/* Ô tìm kiếm */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Lọc trạng thái */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Vô hiệu hoá</option>
        </select>

        {/* Nút thêm người dùng */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition active:scale-95"
        >
          <FiPlus />
          Thêm người dùng
        </button>
      </motion.div>

{/* Thống kê người dùng */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
    <p className="text-gray-500 dark:text-gray-400">Tổng số người dùng</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">
      {users.length}
    </p>
  </div>

  <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-2xl shadow-sm">
    <p className="text-green-700 dark:text-green-300">Đang hoạt động</p>
    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
      {users.filter((u) => u.active).length}
    </p>
  </div>

  <div className="p-4 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-2xl shadow-sm">
    <p className="text-orange-700 dark:text-orange-300">Vô hiệu hoá</p>
    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
      {users.filter((u) => !u.active).length}
    </p>
  </div>
</div>

      {/* Bảng danh sách */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition"
      >
        <table className="min-w-full table-auto text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="p-4">STT</th>
              <th className="p-4">Họ và tên</th>
              <th className="p-4">Tên người dùng</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  Không có người dùng nào
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  Không tìm thấy người dùng phù hợp
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, idx) => {
                const roleCode = user.roles?.[0] || "ROLE_USER";
                const roleLabel =
                  roleCode === "ROLE_ADMIN" ? "Admin" : "User";

                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="p-4">{startIndex + idx + 1}</td>
                    <td className="p-4">{user.fullName}</td>
                    <td className="p-4">{user.username}</td>
                    <td className="p-4 text-center">
                      <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        roleCode === "ROLE_ADMIN"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100"
                        : "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                      }`}
                      >
                        {roleLabel}
                        </span>
                        </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          user.active
                            ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                            : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
                        }`}
                      >
                        {user.active ? "Đang hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                          title="Cập nhật quyền / trạng thái"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                          title="Xoá người dùng"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </motion.div>

{/* 📄 Phân trang */}
{filteredUsers.length > pageSize && (
  <div className="flex items-center justify-between mt-6 border-t border-gray-100 dark:border-gray-700 pt-4">
    {/* Thông tin tổng số */}
    <span className="text-base text-gray-600 dark:text-gray-400">
      Đang hiển thị {paginatedUsers.length} trên tổng số {filteredUsers.length} người dùng
    </span>

    {/* Điều hướng trang */}
    <div className="flex items-center gap-2">
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-base bg-gray-100 dark:bg-gray-700 rounded-md disabled:opacity-50 transition-colors"
      >
        Trang trước
      </button>

      <span className="px-3 py-1 text-base text-gray-700 dark:text-gray-300">
        Trang {currentPage} / {Math.ceil(filteredUsers.length / pageSize)}
      </span>

      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === Math.ceil(filteredUsers.length / pageSize)}
        className="px-3 py-1 text-base bg-gray-100 dark:bg-gray-700 rounded-md disabled:opacity-50 transition-colors"
      >
        Trang sau
      </button>
    </div>
  </div>
)}

      {/* Modal thêm người dùng */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Thêm người dùng mới
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  value={newUser.fullName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, fullName: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Tên người dùng *
                </label>
                <input
                  type="text"
                  placeholder="VD: admin@gmail.com"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  placeholder="Mật khẩu ≥ 6 ký tự"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Vai trò *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Huỷ
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className={`px-4 py-2 rounded-lg font-semibold text-white shadow-md active:scale-95 transition ${
                  creating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {creating ? "Đang thêm..." : "Thêm"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal cập nhật quyền / trạng thái */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Cập nhật quyền / trạng thái
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {selectedUser.fullName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedUser.username}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Vai trò
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value,
                    })
                  }
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Trạng thái
                </label>
                <select
                  value={selectedUser.active ? "active" : "inactive"}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      active: e.target.value === "active",
                    })
                  }
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Vô hiệu</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Huỷ
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 rounded-lg font-semibold text-white shadow-md active:scale-95 transition bg-blue-600 hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
