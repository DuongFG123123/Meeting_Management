// src/pages/user/DevicePage.jsx
import React, { useEffect, useState } from "react";
import { FiSearch, FiCpu, FiTool } from "react-icons/fi";
import { HiComputerDesktop } from "react-icons/hi2";
import { Spin } from "antd";

export default function DevicePage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  // Fake API (sau này thay API thật)
  useEffect(() => {
    setTimeout(() => {
      setDevices([
        {
          id: 1,
          name: "Máy chiếu Epson X200",
          type: "Máy chiếu",
          status: "AVAILABLE",
          room: "A1",
        },
        {
          id: 2,
          name: "Loa hội nghị JBL 500",
          type: "Loa hội nghị",
          status: "UNDER_MAINTENANCE",
          room: "B2",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusDisplay = (status) => {
    if (status === "AVAILABLE") {
      return {
        text: "Sẵn sàng",
        color: "text-green-700 dark:text-green-400 font-semibold",
      };
    }
    if (status === "UNDER_MAINTENANCE") {
      return {
        text: "Bảo trì",
        color: "text-gray-600 dark:text-gray-300 font-semibold",
      };
    }
    return { text: status, color: "text-gray-500" };
  };

  const filteredDevices = devices.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "Tất cả" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">

      {/* HEADER — giống Phòng họp */}
      <div className="flex items-center gap-4 mb-6 pb-3 border-b border-gray-300 dark:border-gray-700">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md">
          <HiComputerDesktop className="text-white text-2xl" />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Trạng thái thiết bị
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Theo dõi tình trạng thiết bị trong các phòng họp
          </p>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-1/2">
          <FiSearch className="absolute top-3 left-3 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 
            rounded-lg bg-white dark:bg-slate-800 
            text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2
          bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100"
        >
          <option value="Tất cả">Tất cả</option>
          <option value="AVAILABLE">Sẵn sàng</option>
          <option value="UNDER_MAINTENANCE">Bảo trì</option>
        </select>
      </div>

      {/* DEVICE LIST */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.length > 0 ? (
            filteredDevices.map((dv) => {
              const statusDisplay = getStatusDisplay(dv.status);
              const isAvailable = dv.status === "AVAILABLE";

              return (
                <div
                  key={dv.id}
                  className={`
                    rounded-xl p-5 border shadow-md transition-all duration-200
                    ${
                      isAvailable
                        ? "bg-purple-50 border-purple-200 hover:shadow-purple-300 hover:scale-[1.02] dark:bg-purple-900/20 dark:border-purple-700"
                        : "bg-gray-200/60 border-gray-300 dark:bg-slate-700/40 dark:border-slate-600"
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {dv.name}
                    </h2>

                    {dv.status === "UNDER_MAINTENANCE" && (
                      <span className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 font-medium">
                        <FiTool size={12} /> Bảo trì
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    Loại thiết bị: <span className="font-medium">{dv.type}</span>
                  </p>

                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    Thuộc phòng:{" "}
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {dv.room}
                    </span>
                  </p>

                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    Trạng thái:{" "}
                    <span className={statusDisplay.color}>{statusDisplay.text}</span>
                  </p>

                  <div className="mt-4 flex justify-end">
                    <button
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      onClick={() => alert("Xem chi tiết thiết bị (popup)")}
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
              Không tìm thấy thiết bị nào phù hợp.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
