// src/pages/user/CreateMeetingPage.jsx
import React, { useState } from "react";

const CreateMeetingPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    room: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu tạo cuộc họp:", formData);
    // TODO: Gọi API tạo lịch họp
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">➕ Tạo lịch họp mới</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-4 max-w-lg"
      >
        <div>
          <label className="block font-medium">Tên cuộc họp</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Ngày họp</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Giờ họp</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
        </div>
        <div>
          <label className="block font-medium">Phòng họp</label>
          <select
            name="room"
            value={formData.room}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="">-- Chọn phòng --</option>
            <option value="A1">Phòng A1</option>
            <option value="B2">Phòng B2</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="border p-2 w-full rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tạo cuộc họp
        </button>
      </form>
    </div>
  );
};

export default CreateMeetingPage;
