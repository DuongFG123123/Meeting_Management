import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";

export default function DevicesPage() {
  const [devices, setDevices] = useState([
    { id: 1, name: "Jabra Speak 750", type: "Loa", location: "Phòng họp 1", status: "Hoạt động" },
    { id: 2, name: "Logitech Rally Bar", type: "Camera", location: "Phòng họp 2", status: "Không hoạt động" },
    { id: 3, name: "LG One:Quick", type: "Màn hình", location: "Phòng họp 3", status: "Bảo trì" },
    { id: 4, name: "Sony Projector X1", type: "Máy chiếu", location: "Phòng họp 1", status: "Hoạt động" },
    { id: 5, name: "Shure Mic MXA", type: "Micro", location: "Phòng họp 4", status: "Bảo trì" },
    { id: 6, name: "Samsung Flip 2", type: "Màn hình", location: "Phòng họp 2", status: "Không hoạt động" },
    { id: 7, name: "Polycom Trio", type: "Loa", location: "Phòng họp 3", status: "Hoạt động" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({ name: "", type: "", location: "", status: "Hoạt động" });
  const [search, setSearch] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const deviceTypes = ["Loa", "Camera", "Màn hình", "Máy chiếu", "Micro", "Khác"];

  const statusColor = {
    "Hoạt động": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    "Không hoạt động": "bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-gray-300",
    "Bảo trì": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  // dark mode sync
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // --- Bộ lọc tìm kiếm ---
  const filteredDevices = useMemo(() => {
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, devices]);

  // --- Phân trang ---
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const currentDevices = filteredDevices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changePage = (next) => {
    if (next > 0 && next <= totalPages) setCurrentPage(next);
  };

  // --- CRUD ---
  const openModal = (device = null) => {
    if (device) {
      setEditingDevice(device);
      setFormData(device);
    } else {
      setEditingDevice(null);
      setFormData({ name: "", type: "", location: "", status: "Hoạt động" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDevice) {
      setDevices(devices.map((d) => (d.id === editingDevice.id ? { ...formData, id: editingDevice.id } : d)));
    } else {
      const newDevice = { ...formData, id: Date.now() };
      setDevices([...devices, newDevice]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa thiết bị này không?")) {
      setDevices(devices.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="p-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Quản lý thiết bị</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tổng cộng {devices.length} thiết bị được quản lý
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl 
                     hover:bg-blue-700 hover:shadow transition-all dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <FiPlus /> Thêm thiết bị
        </button>
      </div>

      {/* Ô tìm kiếm */}
      <div className="relative mb-5">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên hoặc vị trí..."
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

      {/* Bảng */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-700 border-b text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3">Tên thiết bị</th>
              <th className="px-6 py-3">Loại</th>
              <th className="px-6 py-3">Vị trí</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentDevices.length > 0 ? (
              currentDevices.map((device) => (
                <motion.tr
                  key={device.id}
                  whileHover={{
                    backgroundColor: isDarkMode
                      ? "rgba(51,65,85,0.5)"
                      : "rgba(243,244,246,0.6)",
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="border-b border-gray-100 dark:border-slate-700 transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-100">{device.name}</td>
                  <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{device.type}</td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{device.location}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor[device.status]}`}
                    >
                      {device.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2 justify-center">
                    <button
                      onClick={() => openModal(device)}
                      className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 
                                 px-3 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200"
                    >
                      <FiEdit2 /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(device.id)}
                      className="flex items-center gap-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 
                                 px-3 py-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-200"
                    >
                      <FiTrash2 /> Xóa
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Không tìm thấy thiết bị phù hợp
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
                  {editingDevice ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên thiết bị</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loại thiết bị</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-900 
                               rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none 
                               text-gray-800 dark:text-gray-100"
                  >
                    <option value="">-- Chọn loại thiết bị --</option>
                    {deviceTypes.map((t, i) => (
                      <option key={i} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vị trí</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-900 
                               rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none 
                               text-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-900 
                               rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none 
                               text-gray-800 dark:text-gray-100"
                  >
                    <option>Hoạt động</option>
                    <option>Bảo trì</option>
                    <option>Không hoạt động</option>
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
                    {editingDevice ? "Cập nhật" : "Thêm mới"}
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
