"use client"

import { useState, useEffect } from "react"
import { Trash2, Search, Edit2 } from "lucide-react"
import type { User } from "@/hooks/use-auth"

interface Account extends User {
  createdAt: string
  password: string
}

interface EditingUser {
  id: string
  permission: "user" | "room_creator"
}

interface CreatingUser {
  fullName: string
  email: string
  password: string
  permission: "user" | "room_creator"
}

export default function UserManagement() {
  const [users, setUsers] = useState<Account[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newUser, setNewUser] = useState<CreatingUser>({
    fullName: "",
    email: "",
    password: "",
    permission: "user",
  })
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    const accountsStr = localStorage.getItem("accounts")
    if (accountsStr) {
      try {
        const accounts = JSON.parse(accountsStr)
        const regularUsers = accounts.filter((acc: any) => acc.role !== "admin")
        setUsers(regularUsers)
      } catch {
        setUsers([])
      }
    }
  }

  const deleteUser = (email: string) => {
    const accountsStr = localStorage.getItem("accounts")
    if (accountsStr) {
      const accounts = JSON.parse(accountsStr)
      const updatedAccounts = accounts.filter((acc: any) => acc.email !== email)
      localStorage.setItem("accounts", JSON.stringify(updatedAccounts))
      loadUsers()
    }
  }

  const updateUserPermission = (userId: string, newPermission: "user" | "room_creator") => {
    const accountsStr = localStorage.getItem("accounts")
    if (accountsStr) {
      const accounts = JSON.parse(accountsStr)
      const updatedAccounts = accounts.map((acc: any) =>
        acc.id === userId ? { ...acc, permission: newPermission } : acc,
      )
      localStorage.setItem("accounts", JSON.stringify(updatedAccounts))
      setEditingUser(null)
      loadUsers()
    }
  }

  const handleCreateUser = () => {
    setErrorMessage("")

    if (!newUser.fullName.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      setErrorMessage("Email không hợp lệ")
      return
    }

    const accountsStr = localStorage.getItem("accounts")
    const accounts = accountsStr ? JSON.parse(accountsStr) : []

    if (accounts.some((acc: any) => acc.email === newUser.email)) {
      setErrorMessage("Email này đã được sử dụng")
      return
    }

    const regularUsers = accounts.filter((acc: any) => acc.role !== "admin")
    const newId = (regularUsers.length + 1).toString()

    const account = {
      id: newId,
      email: newUser.email,
      password: newUser.password,
      fullName: newUser.fullName,
      role: "user",
      permission: newUser.permission,
      createdAt: new Date().toISOString(),
    }

    accounts.push(account)
    localStorage.setItem("accounts", JSON.stringify(accounts))

    setIsCreating(false)
    setNewUser({
      fullName: "",
      email: "",
      password: "",
      permission: "user",
    })
    loadUsers()
  }

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quản lý người dùng</h2>
          <p className="text-muted-foreground mt-1">Tổng cộng {users.length} tài khoản người dùng đã đăng ký</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium"
        >
          + Thêm người dùng
        </button>
      </div>

      {/* Search Box */}
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

      {/* Users Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Không có người dùng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
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
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.email} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{user.id}</td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{user.fullName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
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
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Chỉnh sửa quyền hạn</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Chọn quyền hạn:</label>
                <div className="space-y-2">
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

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tạo tài khoản người dùng mới</h3>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{errorMessage}</div>
            )}
            <div className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quyền hạn</label>
                <div className="space-y-2">
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