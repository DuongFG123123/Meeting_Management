// src/pages/user/HistoryPage.jsx
import React, { useEffect, useState } from "react";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // TODO: Gọi API lấy lịch sử cuộc họp đã tham gia
    setHistory([
      { id: 1, title: "Họp quý 3", date: "2025-09-21", room: "Phòng A1" },
      { id: 2, title: "Đánh giá tiến độ", date: "2025-10-10", room: "Phòng B2" },
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">📖 Lịch sử họp</h1>
      <div className="bg-white shadow rounded-lg p-4">
        {history.length === 0 ? (
          <p className="text-gray-500">Chưa có cuộc họp nào trong lịch sử.</p>
        ) : (
          <ul className="divide-y">
            {history.map((item) => (
              <li key={item.id} className="py-3">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">
                  {item.date} • {item.room}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
