"use client"

import { useState, useEffect } from "react"
import { Trash2, Search, Edit2, Plus } from "lucide-react"

interface Device {
  id: string
  name: string
  type: string
  location: string
  status: "active" | "inactive" | "maintenance"
  addedAt: string
}

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newDevice, setNewDevice] = useState({
    name: "",
    type: "projector",
    location: "",
  })
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = () => {
    const devicesStr = localStorage.getItem("devices")
    if (devicesStr) {
      try {
        setDevices(JSON.parse(devicesStr))
      } catch {
        setDevices([])
      }
    }
  }

  const handleCreateDevice = () => {
    setErrorMessage("")

    if (!newDevice.name.trim() || !newDevice.location.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin")
      return
    }

    const device: Device = {
      id: Date.now().toString(),
      name: newDevice.name,
      type: newDevice.type,
      location: newDevice.location,
      status: "active",
      addedAt: new Date().toISOString(),
    }

    const updatedDevices = [...devices, device]
    localStorage.setItem("devices", JSON.stringify(updatedDevices))
    setDevices(updatedDevices)
    setIsCreating(false)
    setNewDevice({ name: "", type: "projector", location: "" })
  }

  const deleteDevice = (id: string) => {
    const updatedDevices = devices.filter((d) => d.id !== id)
    localStorage.setItem("devices", JSON.stringify(updatedDevices))
    setDevices(updatedDevices)
  }

  const updateDevice = (id: string, newStatus: "active" | "inactive" | "maintenance") => {
    const updatedDevices = devices.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    localStorage.setItem("devices", JSON.stringify(updatedDevices))
    setDevices(updatedDevices)
    setEditingDevice(null)
  }

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
      case "inactive":
        return "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
      case "maintenance":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
      default:
        return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      active: "Hoạt động",
      inactive: "Không hoạt động",
      maintenance: "Bảo trì",
    }
    return labels[status] || status
  }
  const deviceTypeLabels: { [key: string]: string } = {
    projector: "Máy chiếu",
    speaker: "Loa",
    microphone: "Microphone",
    camera: "Camera",
    screen: "Màn hình",
    other: "Khác",
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quản lý thiết bị</h2>
          <p className="text-muted-foreground mt-1">Tổng cộng {devices.length} thiết bị được quản lý</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm thiết bị
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc vị trí..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {filteredDevices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Không có thiết bị nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tên thiết bị</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Loại</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Vị trí</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Trạng thái</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((device) => (
                  <tr key={device.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{device.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{deviceTypeLabels[device.type] || device.type}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{device.location}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}
                      >
                        {getStatusLabel(device.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingDevice(device)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-medium"
                        >
                          <Edit2 size={16} />
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa thiết bị ${device.name}?`)) {
                              deleteDevice(device.id)
                            }
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Chỉnh sửa trạng thái thiết bị</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Chọn trạng thái:</label>
                <div className="space-y-2">
                  {["active", "inactive", "maintenance"].map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={editingDevice.status === status}
                        onChange={() =>
                          setEditingDevice({
                            ...editingDevice,
                            status: status as "active" | "inactive" | "maintenance",
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-foreground">{getStatusLabel(status)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setEditingDevice(null)}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => updateDevice(editingDevice.id, editingDevice.status)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Thêm thiết bị mới</h3>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{errorMessage}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tên thiết bị</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="Nhập tên thiết bị"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Loại thiết bị</label>
                <select
                  value={newDevice.type}
                  onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="projector">Máy chiếu</option>
                  <option value="speaker">Loa</option>
                  <option value="microphone">Microphone</option>
                  <option value="camera">Camera</option>
                  <option value="screen">Màn hình</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Vị trí</label>
                <input
                  type="text"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                  placeholder="Nhập vị trí thiết bị"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setErrorMessage("")
                  }}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateDevice}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium"
                >
                  Thêm thiết bị
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
