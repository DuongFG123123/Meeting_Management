import { useEffect, useState } from "react";
import { getDevices, createDevice, updateDevice, deleteDevice } from "../../services/deviceService";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [newDevice, setNewDevice] = useState({ name: "", description: "" });

  useEffect(() => {
    getDevices().then((res) => setDevices(res.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createDevice(newDevice);
    setNewDevice({ name: "", description: "" });
    const res = await getDevices();
    setDevices(res.data);
  };

  const handleDelete = async (id) => {
    await deleteDevice(id);
    setDevices(devices.filter((d) => d.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">⚙️ Quản lý thiết bị</h1>

      <form onSubmit={handleCreate} className="mb-4 space-x-3">
        <input
          placeholder="Tên thiết bị"
          value={newDevice.name}
          onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Mô tả"
          value={newDevice.description}
          onChange={(e) => setNewDevice({ ...newDevice, description: e.target.value })}
          className="border p-2 rounded"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Thêm</button>
      </form>

      <table className="min-w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Tên</th>
            <th className="p-2 border">Mô tả</th>
            <th className="p-2 border text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id}>
              <td className="p-2 border">{d.name}</td>
              <td className="p-2 border">{d.description}</td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => handleDelete(d.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
