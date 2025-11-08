// src/pages/user/MyMeetingsPage.jsx
import React, { useEffect, useState } from "react";

const MyMeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    // TODO: Gọi API lấy danh sách lịch họp của user
    setMeetings([
      { id: 1, title: "Họp dự án React", date: "2025-11-10", time: "09:00", room: "Phòng A1" },
      { id: 2, title: "Review Sprint", date: "2025-11-11", time: "14:00", room: "Phòng B2" },
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">📅 Lịch họp của tôi</h1>
      <div className="bg-white shadow rounded-lg p-4">
        {meetings.length === 0 ? (
          <p className="text-gray-500">Bạn chưa có cuộc họp nào sắp tới.</p>
        ) : (
          <table className="w-full text-left border-t">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="py-2">Tên cuộc họp</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Phòng</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{m.title}</td>
                  <td>{m.date}</td>
                  <td>{m.time}</td>
                  <td>{m.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyMeetingsPage;
