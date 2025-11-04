
"use client"

import { CreatingUser } from "./types"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: () => void
  newUser: CreatingUser
  setNewUser: (user: CreatingUser) => void
  errorMessage: string
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreate,
  newUser,
  setNewUser,
  errorMessage,
}: CreateUserModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Tạo tài khoản người dùng mới</h3>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          {/* Tên người dùng */}
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

          {/* Email */}
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

          {/* Mật khẩu */}
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

          {/* Quyền hạn */}
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

          {/* Nút hành động */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
            >
              Hủy
            </button>
            <button
              onClick={onCreate}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium"
            >
              Tạo tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
