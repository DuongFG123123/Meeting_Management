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

    toast.info(
      <div className="text-center">
        <p className="font-medium mb-2">🗑️ Bạn có chắc muốn xoá người dùng này?</p>
        <div className="flex justify-center gap-3 mt-3">
          <button
            onClick={async () => {
              try {
                await deleteUser(id);
                toast.dismiss();
                toast.success("✅ Đã xoá người dùng!");
                setUsers((prev) => prev.filter((u) => u.id !== id));
              } catch (err) {
                console.error("❌ Lỗi khi xoá:", err.response?.data || err);
                toast.dismiss();
                toast.error(
                  err.response?.data?.message ||
                    "Không thể xoá người dùng! Có thể do quyền hoặc ràng buộc dữ liệu."
                );
              }
            }}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Xoá
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition"
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
            className={`${
              creating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            } text-white font-semibold rounded-lg px-4 py-2 transition`}
          >
            {creating ? "Đang thêm..." : "Thêm"}
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
