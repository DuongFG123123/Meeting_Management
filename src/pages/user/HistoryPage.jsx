// src/pages/user/HistoryPage.jsx
import React, { useEffect, useState } from "react";
import { FiCalendar, FiMapPin, FiClock } from "react-icons/fi";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // ✅ TODO: Gọi API lấy lịch sử cuộc họp đã tham gia
    setTimeout(() => {
      setHistory([
        {
          id: 1,
          title: "Họp quý 3 - Đánh giá hiệu suất",
          date: "2025-09-21",
          time: "09:00 - 11:00",
          room: "Phòng A1",
        },
        {
          id: 2,
          title: "Họp dự án - Tiến độ Sprint 5",
          date: "2025-10-10",
          time: "14:00 - 15:30",
          room: "Phòng B2",
        },
      ]);
    }, 300);
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        📖 Lịch sử họp đã tham gia
      </h1>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-5 transition-colors duration-300">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <FiCalendar size={32} className="mb-3" />
            <p>Hiện chưa có cuộc họp nào trong lịch sử.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            {history.map((item) => (
              <li
                key={item.id}
                className="py-4 hover:bg-gray-50 dark:hover:bg-slate-700/40 rounded-xl transition-colors duration-200 px-2"
              >
                <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  {item.title}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <FiCalendar size={14} /> {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock size={14} /> {item.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiMapPin size={14} /> {item.room}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
