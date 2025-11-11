// src/pages/user/UserRoomsPage.jsx
import React, { useEffect, useState } from "react";
import { FiSearch, FiTool, FiMonitor, FiUsers } from "react-icons/fi";
import { Spin, message } from "antd"; // <-- THÊM
import { getAllRooms } from "../../services/roomService"; // <-- CHỈ CẦN API NÀY
import { useNavigate } from "react-router-dom";
// (Không cần dayjs nữa)

const UserRoomsPage = () => {
  const [rooms, setRooms] = useState([]); 
  const [processedRooms, setProcessedRooms] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả"); // <-- Sẽ dùng Tiếng Anh (API)
  const navigate = useNavigate();

  // === 1. TẢI DỮ LIỆU (ĐÃ ĐƠN GIẢN HÓA) ===
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await getAllRooms(); // Chỉ gọi 1 API
        setRooms(res.data || []);
        setProcessedRooms(res.data || []); // Cập nhật cả 2 state
      } catch (err) {
        console.error("Lỗi tải danh sách phòng:", err);
        message.error("Không thể tải danh sách phòng họp.");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []); // Chỉ chạy 1 lần

  // === 2. HÀM DỊCH TRẠNG THÁI ===
  const getStatusDisplay = (apiStatus) => {
    if (apiStatus === "AVAILABLE") {
      return { 
        text: "Trống", 
        color: "text-green-600 dark:text-green-400 font-medium" 
      };
    }
    if (apiStatus === "UNDER_MAINTENANCE") {
      return { 
        text: "Đang bảo trì", 
        color: "text-yellow-600 dark:text-yellow-400 font-medium" 
      };
    }
    return { 
      text: apiStatus, 
      color: "text-gray-500 dark:text-gray-400 font-medium" 
    };
  };

  // === 3. LỌC PHÒNG (ĐÃ CẬP NHẬT) ===
  useEffect(() => {
    const filtered = rooms.filter((room) => {
      const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Lọc theo trạng thái API (tiếng Anh)
      const matchesStatus =
        filterStatus === "Tất cả" || room.status === filterStatus;
        
      return matchesSearch && matchesStatus;
    });
    setProcessedRooms(filtered);
  }, [searchTerm, filterStatus, rooms]); // Chạy lại khi bộ lọc thay đổi

  // Hàm Đặt phòng (Giữ nguyên)
  const handleBookRoom = (room) => {
    navigate('/user/create-meeting', { state: { prefilledRoom: room } });
    message.info(`Chuyển đến trang tạo cuộc họp cho ${room.name}`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        🏢 Danh sách phòng họp
      </h1>

      {/* Bộ lọc & tìm kiếm (ĐÃ CẬP NHẬT) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Tìm kiếm (giữ nguyên) */}
        <div className="relative w-full md:w-1/2">
           <FiSearch className="absolute top-3 left-3 text-gray-500 dark:text-gray-400" />
           <input
             type="text"
             placeholder="Tìm kiếm theo tên phòng..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 
                        rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none
                        bg-white dark:bg-slate-800 
                        text-gray-800 dark:text-gray-100
                        placeholder-gray-400 dark:placeholder-gray-500"
           />
        </div>

        {/* Lọc trạng thái (ĐÃ SỬA: Bỏ "Đang bận") */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2
                     focus:ring-2 focus:ring-blue-400 focus:outline-none
                     bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100"
        >
          {/* Giá trị (value) phải khớp với API (AVAILABLE, UNDER_MAINTENANCE) */}
          <option value="Tất cả">Tất cả</option>
          <option value="AVAILABLE">Trống</option>
          <option value="UNDER_MAINTENANCE">Đang bảo trì</option>
        </select>
      </div>

      {/* === 5. DANH SÁCH PHÒNG (ĐÃ CẬP NHẬT) === */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedRooms.length > 0 ? (
            processedRooms.map((room) => {
              const statusDisplay = getStatusDisplay(room.status);
              const isAvailable = room.status === "AVAILABLE";

              return (
                <div
                  key={room.id}
                  className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-5 border
                             border-gray-200 dark:border-slate-700
                             hover:shadow-lg dark:hover:shadow-slate-700/50 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {room.name}
                    </h2>
                    {room.status === "UNDER_MAINTENANCE" && (
                      <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                        <FiTool size={12} /> Bảo trì
                      </span>
                    )}
                  </div>

                  <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mt-1">
                    <FiUsers size={14} /> Sức chứa: {room.capacity} người
                  </p>
                  
                  <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mt-1">
                    <FiMonitor size={14} /> Thiết bị:{" "}
                    {room.fixedDevices && room.fixedDevices.length > 0
                      ? room.fixedDevices.join(", ")
                      : "Không có"}
                  </p>
                  
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Trạng thái:{" "}
                    <span className={statusDisplay.color}>
                      {statusDisplay.text}
                    </span>
                  </p>

                  {/* BỎ: "Bận đến" */}

                  <div className="mt-4 flex justify-end">
                    <button
                      disabled={!isAvailable}
                      onClick={() => handleBookRoom(room)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isAvailable
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Đặt phòng
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
              Không có phòng nào phù hợp với bộ lọc.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserRoomsPage;