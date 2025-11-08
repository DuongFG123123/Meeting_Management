// src/pages/user/UserRoomsPage.jsx
import React, { useEffect, useState } from "react";

const UserRoomsPage = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // TODO: Gọi API lấy danh sách phòng trống
    setRooms([
      { id: 1, name: "Phòng A1", capacity: 8, status: "Trống" },
      { id: 2, name: "Phòng B2", capacity: 12, status: "Đang bận" },
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">🏢 Danh sách phòng họp</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white shadow rounded-lg p-4 border hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold">{room.name}</h2>
            <p>Sức chứa: {room.capacity} người</p>
            <p>
              Trạng thái:{" "}
              <span
                className={
                  room.status === "Trống" ? "text-green-600" : "text-red-600"
                }
              >
                {room.status}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserRoomsPage;
