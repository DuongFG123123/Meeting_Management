// src/pages/user/ProfilePage.jsx
import React, { useState } from "react";

const ProfilePage = () => {
  const [user, setUser] = useState({
    name: "Nguyễn Văn A",
    email: "vana@example.com",
    department: "Phòng Kỹ thuật",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Thông tin mới:", user);
    // TODO: Gọi API cập nhật thông tin
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-semibold mb-4">👤 Thông tin cá nhân</h1>
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block font-medium">Họ và tên</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Phòng ban</label>
          <input
            type="text"
            name="department"
            value={user.department}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
