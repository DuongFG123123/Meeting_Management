"use client"

import { useState, useEffect } from "react"
import { Trash2, Search, Edit2 } from "lucide-react"
import type { User } from "@/hooks/use-auth"

// ===== INTERFACES =====
// Cấu trúc Account (lưu trong localStorage, có thêm password)
interface Account extends User {
  createdAt: string // Thời gian tạo
  password: string // Mật khẩu (không trả về user)
}

// Cấu trúc dữ liệu user đang chỉnh sửa
interface EditingUser {
  id: string
  permission: "user" | "room_creator"
}

// Cấu trúc dữ liệu user mới đang tạo
interface CreatingUser {
  fullName: string
  email: string
  password: string
  permission: "user" | "room_creator"
}

// ===== COMPONENT: Quản lý Người dùng =====
export default function UserManagement() {
  // State: danh sách user (không kể admin)
  const [users, setUsers] = useState<Account[]>([])

  // State: từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("")

  // State: user đang chỉnh sửa quyền hạn (null nếu không có)
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null)

  // State: có đang tạo user mới không
  const [isCreating, setIsCreating] = useState(false)

  // State: dữ liệu user mới
  const [newUser, setNewUser] = useState<CreatingUser>({
    fullName: "",
    email: "",
    password: "",
    permission: "user",
  })

  // State: thông báo lỗi khi tạo user
  const [errorMessage, setErrorMessage] = useState("")

  // ===== useEffect: Tải danh sách user khi component mount =====
  useEffect(() => {
    loadUsers()
  }, [])

  // ===== HÀM: Tải danh sách user từ localStorage =====
  const loadUsers = () => {
    const accountsStr = localStorage.getItem("accounts")
    if (accountsStr) {
      try {
        const accounts = JSON.parse(accountsStr)
        // Lọc ra những user không phải admin
        const regularUsers = accounts.filter((acc: any) => acc.role !== "admin")
        setUsers(regularUsers)
      } catch {
        setUsers([])
      }
    }
  }

  // ===== HÀM: Xóa user =====
  const deleteUser = (email: string) => {
    const accountsStr = localStorage.getItem("accounts")
    if (accountsStr) {
      const accounts = JSON.parse(accountsStr)
      // Lọc bỏ user có email trùng
      const updatedAccounts = accounts.filter((acc: any) => acc.email !== email)
      // Lưu lại vào localStorage
      localStorage.setItem("accounts", JSON.stringify(updatedAccounts))
      // Tải lại danh sách
      loadUsers()
    }
  }

  // ===== HÀM: Cập nhật quyền hạn của user =====
  const updateUserPermission = (userId: string, newPermission: "user" | "room_creator") => {
    const accountsStr = localStorage.getItem("accounts")
    if (accountsStr) {
      const accounts = JSON.parse(accountsStr)
      // Map lại danh sách accounts, cập nhật permission của user có id trùng
      const updatedAccounts = accounts.map((acc: any) =>
        acc.id === userId ? { ...acc, permission: newPermission } : acc,
      )
      // Lưu vào localStorage
      localStorage.setItem("accounts", JSON.stringify(updatedAccounts))
      // Đóng modal sửa
      setEditingUser(null)
      // Tải lại danh sách
      loadUsers()
    }
  }

  // ===== HÀM: Tạo user mới (bởi admin) =====
  const handleCreateUser = () => {
    setErrorMessage("")

    // Kiểm tra các trường bắt buộc
    if (!newUser.fullName.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin")
      return
    }

    // Kiểm tra định dạng email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      setErrorMessage("Email không hợp lệ")
      return
    }

    // Lấy danh sách accounts
    const accountsStr = localStorage.getItem("accounts")
    const accounts = accountsStr ? JSON.parse(accountsStr) : []

    // Kiểm tra email đã tồn tại
    if (accounts.some((acc: any) => acc.email === newUser.email)) {
      setErrorMessage("Email này đã được sử dụng")
      return
    }

    // Tính ID mới
    const regularUsers = accounts.filter((acc: any) => acc.role !== "admin")
    const newId = (regularUsers.length + 1).toString()

    // Tạo object account mới
    const account = {
      id: newId,
      email: newUser.email,
      password: newUser.password,
      fullName: newUser.fullName,
      role: "user",
      permission: newUser.permission,
      createdAt: new Date().toISOString(),
    }

    // Thêm vào danh sách và lưu
    accounts.push(account)
    localStorage.setItem("accounts", JSON.stringify(accounts))

    // Đóng modal và reset form
    setIsCreating(false)
    setNewUser({
      fullName: "",
      email: "",
      password: "",
      permission: "user",
    })
    // Tải lại danh sách
    loadUsers()
  }

  // ===== FILTER: Lọc user theo tên hoặc email =====
  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* ===== HEADER: Tiêu đề + Nút Thêm Người dùng ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quản lý người dùng</h2>
          <p className="text-muted-foreground mt-1">Tổng cộng {users.length} tài khoản người dùng đã đăng ký</p>
        </div>
        {/* Nút mở modal tạo user mới */}
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium"
        >
          + Thêm người dùng
        </button>
      </div>

      {/* ===== SEARCH BOX: Tìm kiếm user ===== */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* ===== USER TABLE: Bảng hiển thị danh sách user ===== */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Không có người dùng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Bảng Header */}
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tên người dùng</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Quyền hạn</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ngày đăng ký</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Hành động</th>
                </tr>
              </thead>
              {/* Bảng Body */}
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.email} className="border-b border-border hover:bg-muted/50 transition">
                    {/* Cột ID */}
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{user.id}</td>
                    {/* Cột Tên */}
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{user.fullName}</td>
                    {/* Cột Email */}
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                    {/* Cột Quyền hạn */}
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.permission === "room_creator"
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {user.permission === "room_creator" ? "Tạo phòng" : "Người dùng"}
                      </span>
                    </td>
                    {/* Cột Ngày đăng ký */}
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    {/* Cột Hành động */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Nút Sửa */}
                        <button
                          onClick={() =>
                            setEditingUser({
                              id: user.id,
                              permission: user.permission,
                            })
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-medium"
                        >
                          <Edit2 size={16} />
                          Sửa
                        </button>
                        {/* Nút Xóa */}
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa người dùng ${user.fullName}?`)) {
                              deleteUser(user.email)
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

      {/* ===== MODAL: Chỉnh sửa quyền hạn user ===== */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Chỉnh sửa quyền hạn</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Chọn quyền hạn:</label>
                <div className="space-y-2">
                  {/* Option: Người dùng thông thường */}
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <input
                      type="radio"
                      name="permission"
                      value="user"
                      checked={editingUser.permission === "user"}
                      onChange={() =>
                        setEditingUser({
                          ...editingUser,
                          permission: "user",
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-foreground">Người dùng thông thường</span>
                  </label>
                  {/* Option: Có quyền tạo phòng */}
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <input
                      type="radio"
                      name="permission"
                      value="room_creator"
                      checked={editingUser.permission === "room_creator"}
                      onChange={() =>
                        setEditingUser({
                          ...editingUser,
                          permission: "room_creator",
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-foreground">Có quyền tạo phòng</span>
                  </label>
                </div>
              </div>
              {/* Nút Hủy và Lưu */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => updateUserPermission(editingUser.id, editingUser.permission)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Tạo tài khoản user mới ===== */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tạo tài khoản người dùng mới</h3>
            {/* Thông báo lỗi */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{errorMessage}</div>
            )}
            <div className="space-y-4">
              {/* Input Tên người dùng */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tên người dùng</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="Nhập tên người dùng"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {/* Input Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Nhập email"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {/* Input Mật khẩu */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {/* Chọn Quyền hạn */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quyền hạn</label>
                <div className="space-y-2">
                  {/* Option: Người dùng thông thường */}
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <input
                      type="radio"
                      name="permission"
                      value="user"
                      checked={newUser.permission === "user"}
                      onChange={() => setNewUser({ ...newUser, permission: "user" })}
                      className="w-4 h-4"
                    />
                    <span className="text-foreground">Người dùng thông thường</span>
                  </label>
                  {/* Option: Có quyền tạo phòng */}
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <input
                      type="radio"
                      name="permission"
                      value="room_creator"
                      checked={newUser.permission === "room_creator"}
                      onChange={() => setNewUser({ ...newUser, permission: "room_creator" })}
                      className="w-4 h-4"
                    />
                    <span className="text-foreground">Có quyền tạo phòng</span>
                  </label>
                </div>
              </div>
              {/* Nút Hủy và Tạo Tài Khoản */}
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
                  onClick={handleCreateUser}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium"
                >
                  Tạo tài khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}