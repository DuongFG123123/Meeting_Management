import { useEffect, useState } from "react";
import { getDevices, createDevice, updateDevice, deleteDevice } from "../../services/deviceService";
import { Search, Plus, Edit2, Trash2, X, Check, AlertCircle, AlertTriangle } from "lucide-react";

// Sử dụng size chữ giống UsersPage (ví dụ: tên tiêu đề text-3xl, table text-base, th: text-base font-semibold)
export default function DevicesPage() {
  // States
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "AVAILABLE"
  });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch devices on mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Filter devices when search/filter changes
  useEffect(() => {
    let filtered = devices;

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    setFilteredDevices(filtered);
  }, [devices, searchTerm, statusFilter]);

  // API Calls
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await getDevices();
      setDevices(response.data);
      setFilteredDevices(response.data);
    } catch (error) {
      showNotification("Không thể tải danh sách thiết bị", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenModal = (device = null) => {
    if (device) {
      setEditingDevice(device);
      setFormData({
        name: device.name,
        description: device.description,
        status: device.status
      });
    } else {
      setEditingDevice(null);
      setFormData({ name: "", description: "", status: "AVAILABLE" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
    setFormData({ name: "", description: "", status: "AVAILABLE" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showNotification("Vui lòng nhập tên thiết bị", "error");
      return;
    }

    try {
      setLoading(true);

      // Prepare data - ensure status is sent correctly
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status
      };

      if (editingDevice) {
        await updateDevice(editingDevice.id, submitData);
        showNotification("Cập nhật thiết bị thành công!");
      } else {
        await createDevice(submitData);
        showNotification("Thêm thiết bị mới thành công!");
      }

      await fetchDevices();
      handleCloseModal();
    } catch (error) {
      showNotification(
        `❌ ${editingDevice ? "Cập nhật" : "Thêm"} thiết bị thất bại: ${error.response?.data?.message || error.message}`,
        "error"
      );
      console.error("Submit error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (device) => {
    setDeviceToDelete(device);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeviceToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!deviceToDelete) return;

    try {
      setLoading(true);
      await deleteDevice(deviceToDelete.id);
      showNotification("Đã xóa thiết bị thành công!");
      await fetchDevices();
      handleCloseDeleteModal();
    } catch (error) {
      showNotification("Xóa thiết bị thất bại", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      AVAILABLE:
        "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100",
      UNDER_MAINTENANCE:
        "bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-orange-100"
    };

    const labels = {
      AVAILABLE: "Có sẵn",
      UNDER_MAINTENANCE: "Đang bảo trì"
    };

    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status]}`}
        style={{ fontSize: "0.95rem", letterSpacing: 0 }}
      >
        {labels[status]}
      </span>
    );
  };

  const getStatsByStatus = (status) => {
    return devices.filter((d) => d.status === status).length;
  };

  return (
    <div className="p-8 min-h-screen transition-colors bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <span>
          <svg width={32} height={32} viewBox="0 0 24 24" className="text-blue-600 dark:text-blue-400">
            <g>
              <circle cx="12" cy="12" r="10" fill="#3b82f6" opacity="0.15" />
              <path d="M9 9h6M9 13h3" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="17" cy="7" r="1.5" fill="#2563eb" />
            </g>
          </svg>
        </span>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Quản lý thiết bị
        </h1>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mb-4 py-4 px-6 rounded-xl flex items-center gap-3 animate-slide-down border
            ${
              notification.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800"
            }
            text-base`
          }
        >
          <AlertCircle size={22} />
          <span className="flex-1 text-base">{notification.message}</span>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-7 border border-gray-100 dark:border-gray-700 transition">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm thiết bị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-gray-900
              placeholder-gray-400 dark:placeholder-gray-500
              focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-400 focus:border-transparent
              transition-all duration-200 text-base"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-base px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white
            text-gray-900 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-400 focus:border-transparent
             transition-all duration-200 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="AVAILABLE">Có sẵn</option>
            <option value="UNDER_MAINTENANCE">Đang bảo trì</option>
          </select>

          {/* Add Button */}
          <button
            onClick={() => handleOpenModal()}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-base
              disabled:bg-blue-400 disabled:cursor-not-allowed
              text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Thêm thiết bị
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow transition">
          <div className="text-gray-500 dark:text-gray-400 text-base mb-0.5">Tổng số thiết bị</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{devices.length}</div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800 shadow transition">
          <div className="text-green-700 dark:text-green-400 text-base mb-0.5">Có sẵn</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-200">
            {getStatsByStatus("AVAILABLE")}
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800 shadow transition">
          <div className="text-orange-700 dark:text-orange-400 text-base mb-0.5">Đang bảo trì</div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-100">
            {getStatsByStatus("UNDER_MAINTENANCE")}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-base text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-4 text-base font-semibold">Tên thiết bị</th>
                <th className="p-4 text-base font-semibold">Mô tả</th>
                <th className="p-4 text-base font-semibold">Trạng thái</th>
                <th className="p-4 text-base font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-base">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={48} className="text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-semibold">Không tìm thấy thiết bị nào</p>
                      <p className="text-base">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{device.name}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {device.description || (
                        <span className="text-gray-400 dark:text-gray-600 italic">Chưa có mô tả</span>
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(device.status)}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(device)}
                          disabled={loading}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300
                            hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-md transition
                            disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(device)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300
                            hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition
                            disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingDevice ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={loading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body - Form */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên thiết bị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Máy chiếu Epson X123"
                    disabled={loading}
                    className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-400 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200"
                    required
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="VD: Máy chiếu full HD, độ phân giải 1920x1080"
                    rows="3"
                    disabled={loading}
                    className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-400 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 resize-none"
                  />
                </div>

                {/* Status Field */}
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-400 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 cursor-pointer"
                    required
                  >
                    <option value="AVAILABLE">Có sẵn</option>
                    <option value="UNDER_MAINTENANCE">Đang bảo trì</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer - Actions */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-base bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                    text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-base
                    bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold 
                    transition-all duration-200 shadow-sm hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      {editingDevice ? "Cập nhật" : "Thêm mới"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Xác nhận xóa
                </h2>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                disabled={loading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
                Bạn có chắc chắn muốn xóa thiết bị này không?
              </p>
              {deviceToDelete && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {deviceToDelete.name}
                      </p>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        {deviceToDelete.description || "Không có mô tả"}
                      </p>
                    </div>
                    {getStatusBadge(deviceToDelete.status)}
                  </div>
                </div>
              )}
              <p className="text-base text-red-600 dark:text-red-400">
                ⚠️ Hành động này không thể hoàn tác!
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-base bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                  text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-base
                  bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold
                  transition-all duration-200 shadow-sm hover:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Xóa thiết bị
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}