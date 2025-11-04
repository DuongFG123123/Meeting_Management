
"use client"

import { Trash2, Edit2 } from "lucide-react"
import { User, EditingUser } from "./types"

interface UserTableProps {
  users: User[]
  onEdit: (user: EditingUser) => void
  onDelete: (email: string) => void
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {users.length === 0 ? (
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
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition">
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
                        onClick={() => onEdit({ id: user.id, permission: user.permission })}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-medium"
                      >
                        <Edit2 size={16} />
                        Sửa
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa người dùng ${user.fullName}?`)) {
                            onDelete(user.email)
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
  )
}
