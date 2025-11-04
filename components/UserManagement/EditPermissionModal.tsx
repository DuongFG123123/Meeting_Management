
"use client"

import { EditingUser } from "./types"

interface EditPermissionModalProps {
  editingUser: EditingUser
  onClose: () => void
  onSave: (id: string, permission: "user" | "room_creator") => void
  setEditingUser: (user: EditingUser) => void
}

export default function EditPermissionModal({
  editingUser,
  onClose,
  onSave,
  setEditingUser,
}: EditPermissionModalProps) {
  return (
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
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
            >
              Hủy
            </button>
            <button
              onClick={() => onSave(editingUser.id, editingUser.permission)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
