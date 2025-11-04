
"use client"

import { useState, useEffect } from "react"
import { User } from "@/hooks/use-auth"
import UserTable from "./UserTable"
import EditPermissionModal from "./EditPermissionModal"
import CreateUserModal from "./CreateUserModal"
import SearchBox from "./SearchBox"

// ===== LOCAL TYPES =====
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
  const [users, setUsers] = useState<User[]>([])
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
        acc.id === userId ? { ...acc, permission: newPermission } : acc
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
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quản lý người dùng</h2>
          <p className="text-muted-foreground mt-1">
            Tổng cộng {users.length} tài khoản người dùng đã đăng ký
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium"
        >
          + Thêm người dùng
        </button>
      </div>

      <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <UserTable users={filteredUsers} onEdit={setEditingUser} onDelete={deleteUser} />

      {editingUser && (
        <EditPermissionModal
          editingUser={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={updateUserPermission}
          setEditingUser={setEditingUser}
        />
      )}

      {isCreating && (
        <CreateUserModal
          isOpen={isCreating}
          onClose={() => {
            setIsCreating(false)
            setErrorMessage("")
          }}
          onCreate={handleCreateUser}
          newUser={newUser}
          setNewUser={setNewUser}
          errorMessage={errorMessage}
        />
      )}
    </div>
  )
}
