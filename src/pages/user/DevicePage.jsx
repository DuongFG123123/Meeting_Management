import React, { useEffect, useState } from "react";

export default function DevicePage() {

  // Bạn sẽ fetch danh sách thiết bị từ API sau
  const [devices, setDevices] = useState([]);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Trạng thái thiết bị</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.length === 0 && (
          <p className="text-gray-500">Đang tải danh sách thiết bị...</p>
        )}

        {devices.map((d) => (
          <div
            key={d.id}
            className="p-4 border rounded-lg shadow-sm bg-white dark:bg-slate-800"
          >
            <h2 className="font-semibold text-lg">{d.name}</h2>
            <p className="text-sm text-gray-500">Trạng thái: {d.status}</p>

            <button
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => alert("Form đặt phòng sẽ thêm sau")}
            >
              Đặt phòng
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
