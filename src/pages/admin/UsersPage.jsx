import { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUser,
  createUser,
  deleteUser,
} from "../../services/userService";
import { toast } from "react-toastify";
import { FiUsers, FiPlus, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

/* Tuỳ chỉnh màu cho Toast theo theme */
const toastColors = {
  success: "#10b981", // xanh ngọc dịu
  error: "#ef4444",   // đỏ ấm
  warning: "#e4650aff", // vàng dịu
  info: "#3b82f6",    // xanh dương nhạt
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
  const [newUser, setNewUser] = useState({
    fullName: "",
    username: "",
    password: "",
  });

  /* Lấy danh sách người dùng */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      console.log("Dữ liệu người dùng:", res.data);
      setUsers(Array.isArray(res.data) ? res.data : res.data.data || []);
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
      };

      const res = await createUser(payload);
      console.log("Đã tạo user:", res.data);

      toast.success("Tạo người dùng thành công!");
      setNewUser({ fullName: "", username: "", password: "" });
      fetchUsers();
    } catch (err) {
      console.error("Lỗi tạo người dùng:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.username ||
        err.response?.data?.password ||
        err.response?.data?.fullName ||
        "Không thể tạo người dùng!";

      // Thay đổi nội dung cảnh báo trùng dữ liệu
      if (msg.toLowerCase().includes("exists") || msg.toLowerCase().includes("duplicate")) {
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

  /* Cập nhật vai trò */
  const handleUpdateRole = async (id, newRole) => {
    try {
      await updateUser(id, { roles: [newRole], isActive: true });
      toast.success("Cập nhật quyền thành công!");
      fetchUsers();
    } catch (err) {
      console.error("Lỗi cập nhật vai trò:", err);
      toast.error("Không thể cập nhật quyền!");
    }
  };

  /* Xoá người dùng */
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
                toast.success("🗑️ Đã xoá người dùng!");
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
          background: isDark ? "#1e293b" : "#ffffff", // dark: slate-800
          color: isDark ? "#e2e8f0" : "#1f2937", // dark: gray-200, light: gray-800
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

      {/* Form thêm người dùng */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-8 border border-gray-100 dark:border-gray-700 transition"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <FiPlus /> Thêm người dùng mới
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Họ và tên"
            value={newUser.fullName}
            onChange={(e) =>
              setNewUser({ ...newUser, fullName: e.target.value })
            }
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
          <input
            type="text"
            placeholder="Tên người dùng"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
          <input
            type="password"
            placeholder="Mật khẩu (≥ 6 ký tự)"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
          <button
          onClick={handleCreateUser}
          disabled={creating}
          className={`relative overflow-hidden font-semibold rounded-lg px-5 py-2.5 transition-all duration-300
            ${
              creating
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg dark:from-blue-400 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-600"
            }
            active:scale-95`}
            >{creating ? (
            <span className="flex items-center gap-2">
              <svg
              className="w-5 h-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              >
                <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                ></circle>
                <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
                </svg>
                Đang thêm...
                </span>
                ) : (
                  "Thêm"
                  )}
                  </button>

        </div>
      </motion.div>

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
            ) : (
              users.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-4">{idx + 1}</td>
                  <td className="p-4">{user.fullName}</td>
                  <td className="p-4">{user.username}</td>
                  <td className="p-4">
                    <select
                      value={user.roles?.[0] || "ROLE_USER"}
                      onChange={(e) =>
                        handleUpdateRole(user.id, e.target.value)
                      }
                      className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-1"
                    >
                      <option value="ROLE_USER">User</option>
                      <option value="ROLE_ADMIN">Admin</option>
                    </select>
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
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
