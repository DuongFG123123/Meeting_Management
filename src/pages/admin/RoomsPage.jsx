import { useEffect, useState } from "react";
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms as fetchAvailableRooms,
} from "../../services/roomService";

 const [newRoom, setNewRoom] = useState({
    name: "",
    capacity: "",
    location: "",
    fixedDivied:[],
    requiedRoled:[],
    status: "ACTIVE",
  })
  const [editingRoom, setEditingRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [checkForm, setCheckForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  // 🟢 Lấy danh sách tất cả phòng
  const fetchRooms = async () => {
    try {
      const res = await getRooms();
      setRooms(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 🟢 Tạo phòng họp mới
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createRoom(newRoom);
      setNewRoom({ name: "", capacity: "", location: "" });
      fetchRooms();
    } catch (error) {
      console.error("Lỗi khi tạo phòng:", error);
      alert("Không thể tạo phòng, vui lòng thử lại.");
    }
  };

  // 🟠 Cập nhật thông tin phòng
  const handleUpdate = async (id) => {
    try {
      await updateRoom(id, editingRoom);
      setEditingRoom(null);
      fetchRooms();
    } catch (error) {
      console.error("Lỗi khi cập nhật phòng:", error);
      alert("Không thể cập nhật phòng, vui lòng thử lại.");
    }
  };

  // 🔴 Xóa phòng
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa phòng này không?")) {
      try {
        await deleteRoom(id);
        setRooms(rooms.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa phòng:", error);
      }
    }
  };
  <select
  value={newRoom.status}
  onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
  >
  <option value="ACTIVE">Hoạt động</option>
  <option value="MAINTENANCE">Bảo trì</option>
  <option value="INACTIVE">Không sử dụng</option>
  </select>
  // 🔍 Kiểm tra phòng trống
  const handleSubmitAvailableRooms = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchAvailableRooms(checkForm);
      setAvailableRooms(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng trống:", error);
      alert("Không thể tải danh sách phòng trống.");
    }
  };

  if (loading) return <p>Đang tải danh sách phòng...</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">🏢 Quản lý Phòng họp</h1>

      {/* ------------------------ FORM THÊM PHÒNG ------------------------ */}
      <form
        onSubmit={handleCreate}
        className="bg-gray-100 p-4 rounded-lg shadow-sm space-y-3"
      >
        <h2 className="font-semibold text-lg mb-2">➕ Thêm phòng họp mới</h2>
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Tên phòng"
            value={newRoom.name}
            onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Sức chứa"
            value={newRoom.capacity}
            onChange={(e) =>
              setNewRoom({ ...newRoom, capacity: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Vị trí (VD: Tầng 3 - A1)"
            value={newRoom.location}
            onChange={(e) =>
              setNewRoom({ ...newRoom, location: e.target.value })
            }
            className="border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Thêm phòng
        </button>
      </form>

      {/* ------------------------ DANH SÁCH PHÒNG ------------------------ */}
      <div className="overflow-x-auto">
        <h2 className="font-semibold text-lg mb-2">📋 Danh sách phòng họp</h2>
        <table className="min-w-full border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">Tên phòng</th>
              <th className="p-2 border">Sức chứa</th>
              <th className="p-2 border">Vị trí</th>
              <th className="p-2 border text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) =>
              editingRoom?.id === r.id ? (
                <tr key={r.id}>
                  <td className="p-2 border">
                    <input
                      value={editingRoom.name}
                      onChange={(e) =>
                        setEditingRoom({ ...editingRoom, name: e.target.value })
                      }
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      value={editingRoom.capacity}
                      onChange={(e) =>
                        setEditingRoom({
                          ...editingRoom,
                          capacity: e.target.value,
                        })
                      }
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      value={editingRoom.location}
                      onChange={(e) =>
                        setEditingRoom({
                          ...editingRoom,
                          location: e.target.value,
                        })
                      }
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleUpdate(r.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                    >
                      💾 Lưu
                    </button>
                    <button
                      onClick={() => setEditingRoom(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded"
                    >
                      Hủy
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={r.id}>
                  <td className="p-2 border">{r.name}</td>
                  <td className="p-2 border">{r.capacity}</td>
                  <td className="p-2 border">{r.location}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => setEditingRoom(r)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ------------------------ TÌM PHÒNG TRỐNG ------------------------ */}
      <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
        <h2 className="font-semibold text-lg mb-3">
          🔍 Kiểm tra phòng họp trống
        </h2>

        {/* (SỬA LẠI: Gọi đúng hàm onSubmit) */}
        <form
          onSubmit={handleSubmitAvailableRooms}
          className="grid grid-cols-4 gap-3 mb-3"
        >
          <input
            type="date"
            value={checkForm.date}
            onChange={(e) =>
              setCheckForm({ ...checkForm, date: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
          <input
            type="time"
            value={checkForm.startTime}
            onChange={(e) =>
              setCheckForm({ ...checkForm, startTime: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
          <input
            type="time"
            value={checkForm.endTime}
            onChange={(e) =>
              setCheckForm({ ...checkForm, endTime: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🔎 Tìm phòng trống
          </button>
        </form>

        {availableRooms.length > 0 ? (
          <div>
            <h3 className="font-semibold mb-2">Phòng khả dụng:</h3>
            <ul className="list-disc ml-6 space-y-1">
              {availableRooms.map((room) => (
                <li key={room.id}>
                  {room.name} — {room.location} ({room.capacity} người)
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-600 italic">
            Không có phòng trống trong khung giờ này.
          </p>
        )}
      </div>
    </div>
  );
}
