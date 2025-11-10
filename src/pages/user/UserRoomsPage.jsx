import React, { useEffect, useState } from "react";
import { FiSearch, FiTool, FiMonitor, FiClock, FiUsers } from "react-icons/fi";

const UserRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  useEffect(() => {
    // ✅ Giả lập dữ liệu thực tế từ backend
    setRooms([
      {
        id: 1,
        name: "Phòng A1",
        capacity: 8,
        status: "Trống",
        maintenance: false,
        availableUntil: null,
        equipment: ["TV 55''", "Máy chiếu", "Bảng trắng"],
      },
      {
        id: 2,
        name: "Phòng B2",
        capacity: 12,
        status: "Đang bận",
        maintenance: false,
        availableUntil: "2025-11-10 16:30",
        equipment: ["Loa hội nghị", "Micro không dây", "Camera họp"],
      },
      {
        id: 3,
        name: "Phòng C3",
        capacity: 10,
        status: "Đang bảo trì",
        maintenance: true,
        availableUntil: null,
        equipment: ["TV 50''", "Máy chiếu"],
      },
      {
        id: 4,
        name: "Phòng D4",
        capacity: 6,
        status: "Trống",
        maintenance: false,
        availableUntil: null,
        equipment: ["Bảng trắng"],
      },
    ]);
  }, []);

  // 🔍 Lọc phòng theo từ khóa & trạng thái
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "Tất cả" || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        🏢 Danh sách phòng họp
      </h1>

      {/* Bộ lọc & tìm kiếm */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Tìm kiếm */}
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

        {/* Lọc trạng thái */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2
                     focus:ring-2 focus:ring-blue-400 focus:outline-none
                     bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100"
        >
          <option value="Tất cả">Tất cả</option>
          <option value="Trống">Trống</option>
          <option value="Đang bận">Đang bận</option>
          <option value="Đang bảo trì">Đang bảo trì</option>
        </select>
      </div>

      {/* Danh sách phòng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
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
                {room.maintenance && (
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
                {room.equipment.length > 0
                  ? room.equipment.join(", ")
                  : "Không có"}
              </p>

              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Trạng thái:{" "}
                <span
                  className={
                    room.status === "Trống"
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : room.status === "Đang bảo trì"
                      ? "text-yellow-600 dark:text-yellow-400 font-medium"
                      : "text-red-600 dark:text-red-400 font-medium"
                  }
                >
                  {room.status}
                </span>
              </p>

              {room.availableUntil && (
                <p className="flex items-center gap-2 text-sm mt-1 text-gray-500 dark:text-gray-400">
                  <FiClock size={14} /> Bận đến: {room.availableUntil}
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  disabled={room.status !== "Trống" || room.maintenance}
                  onClick={() => alert(`Đặt ${room.name}`)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    room.status === "Trống" && !room.maintenance
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Đặt phòng
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
            Không có phòng nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoomsPage;
