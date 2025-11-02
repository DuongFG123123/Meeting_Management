"use client"

import { useState, useEffect } from "react"
import { Trash2, Search, Edit2, Plus } from "lucide-react"

interface MeetingRoom {
  id: string
  name: string
  capacity: number
  floor: string
  status: "available" | "booked" | "maintenance"
  amenities: string[]
  addedAt: string
}

export default function MeetingRoomManagement() {
  const [rooms, setRooms] = useState<MeetingRoom[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newRoom, setNewRoom] = useState({
    name: "",
    capacity: "10",
    floor: "",
  })
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = () => {
    const roomsStr = localStorage.getItem("meeting_rooms")
    if (roomsStr) {
      try {
        setRooms(JSON.parse(roomsStr))
      } catch {
        setRooms([])
      }
    }
  }

  const handleCreateRoom = () => {
    setErrorMessage("")

    if (!newRoom.name.trim() || !newRoom.floor.trim() || !newRoom.capacity) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin")
      return
    }

    const room: MeetingRoom = {
      id: Date.now().toString(),
      name: newRoom.name,
      capacity: Number.parseInt(newRoom.capacity),
      floor: newRoom.floor,
      status: "available",
      amenities: [],
      addedAt: new Date().toISOString(),
    }

    const updatedRooms = [...rooms, room]
    localStorage.setItem("meeting_rooms", JSON.stringify(updatedRooms))
    setRooms(updatedRooms)
    setIsCreating(false)
    setNewRoom({ name: "", capacity: "10", floor: "" })
  }

  const deleteRoom = (id: string) => {
    const updatedRooms = rooms.filter((r) => r.id !== id)
    localStorage.setItem("meeting_rooms", JSON.stringify(updatedRooms))
    setRooms(updatedRooms)
  }

  const updateRoom = (id: string, newStatus: "available" | "booked" | "maintenance") => {
    const updatedRooms = rooms.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    localStorage.setItem("meeting_rooms", JSON.stringify(updatedRooms))
    setRooms(updatedRooms)
    setEditingRoom(null)
  }

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.floor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
      case "booked":
        return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
      case "maintenance":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      available: "Sẵn sàng",
      booked: "Đã đặt",
      maintenance: "Bảo trì",
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quản lý phòng họp</h2>
          <p className="text-muted-foreground mt-1">Tổng cộng {rooms.length} phòng họp được quản lý</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm phòng họp
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc tầng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {filteredRooms.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Không có phòng họp nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tên phòng</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Sức chứa</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tầng</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Trạng thái</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{room.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{room.capacity} người</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">Tầng {room.floor}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}
                      >
                        {getStatusLabel(room.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingRoom(room)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-medium"
                        >
                          <Edit2 size={16} />
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa phòng ${room.name}?`)) {
                              deleteRoom(room.id)
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

      {editingRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Chỉnh sửa trạng thái phòng</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Chọn trạng thái:</label>
                <div className="space-y-2">
                  {["available", "booked", "maintenance"].map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={editingRoom.status === status}
                        onChange={() =>
                          setEditingRoom({ ...editingRoom, status: status as "available" | "booked" | "maintenance" })
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
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => updateRoom(editingRoom.id, editingRoom.status)}
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
            <h3 className="text-lg font-semibold text-foreground mb-4">Thêm phòng họp mới</h3>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{errorMessage}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tên phòng</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="Nhập tên phòng"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Sức chứa (số người)</label>
                <input
                  type="number"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                  placeholder="Nhập sức chứa"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tầng</label>
                <input
                  type="text"
                  value={newRoom.floor}
                  onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                  placeholder="Nhập tầng"
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
                  onClick={handleCreateRoom}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium"
                >
                  Thêm phòng họp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}