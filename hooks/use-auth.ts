"use client"
import { useState, useEffect, useCallback } from "react"

// ===== INTERFACES & TYPES =====
// Định nghĩa cấu trúc dữ liệu User
export interface User {
  id: string // ID người dùng (số thứ tự: 1, 2, 3...)
  email: string // Email đăng nhập
  fullName: string // Họ và tên
  role: "admin" | "user" // Vai trò: admin (quản lý) hoặc user (thường)
  permission: "user" | "room_creator" // Quyền: user (bình thường) hoặc room_creator (tạo phòng)
}

// Định nghĩa các hàm và state của hook useAuth
export interface AuthContextType {
  user: User | null // Thông tin user hiện tại (null nếu chưa đăng nhập)
  isLoading: boolean // Trạng thái đang tải dữ liệu
  login: (email: string, password: string) => Promise<void> // Hàm đăng nhập
  register: (email: string, password: string, fullName: string) => Promise<void> // Hàm đăng ký
  logout: () => void // Hàm đăng xuất
  createUserByAdmin: (
    email: string,
    password: string,
    fullName: string,
    permission: "user" | "room_creator",
  ) => Promise<void> // Hàm tạo user mới (chỉ admin)
}

// ===== MAIN HOOK FUNCTION =====
export function useAuth() {
  // State: lưu thông tin user hiện tại
  const [user, setUser] = useState<User | null>(null)
  // State: lưu trạng thái đang load dữ liệu
  const [isLoading, setIsLoading] = useState(true)

  // ===== useEffect: Tải user từ localStorage khi component mount =====
  useEffect(() => {
    // Lấy user hiện tại từ localStorage
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        // Nếu lỗi, xóa dữ liệu lỗi khỏi localStorage
        localStorage.removeItem("currentUser")
      }
    }
    // Đặt isLoading = false để kết thúc quá trình load
    setIsLoading(false)
  }, [])

  // ===== HÀM REGISTER: Đăng ký tài khoản mới =====
  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true)
    try {
      // Lấy danh sách tài khoản từ localStorage
      const accountsStr = localStorage.getItem("accounts")
      const accounts = accountsStr ? JSON.parse(accountsStr) : []

      // Kiểm tra email đã tồn tại chưa
      if (accounts.some((acc: any) => acc.email === email)) {
        throw new Error("Email đã được đăng ký")
      }

      // Tính ID mới: lấy số user (không kể admin) + 1
      const regularUsers = accounts.filter((acc: any) => acc.role !== "admin")
      const newId = (regularUsers.length + 1).toString()

      // Tạo object tài khoản mới
      const newAccount = {
        id: newId,
        email,
        password,
        fullName,
        role: "user", // Mặc định là user thường
        permission: "user", // Mặc định là không thể tạo phòng
        createdAt: new Date().toISOString(), // Thời gian đăng ký
      }

      // Thêm vào danh sách accounts và lưu vào localStorage
      accounts.push(newAccount)
      localStorage.setItem("accounts", JSON.stringify(accounts))

      // Tạo User object để lưu vào currentUser
      const user: User = {
        id: newId,
        email,
        fullName,
        role: "user",
        permission: "user",
      }
      setUser(user)
      localStorage.setItem("currentUser", JSON.stringify(user))
      window.location.reload() // Reload trang để cập nhật UI
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ===== HÀM LOGIN: Đăng nhập vào hệ thống =====
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Lấy danh sách accounts từ localStorage
      const accountsStr = localStorage.getItem("accounts")
      const accounts = accountsStr ? JSON.parse(accountsStr) : []

      // Tìm account với email và password trùng khớp
      const account = accounts.find((acc: any) => acc.email === email && acc.password === password)

      if (!account) {
        throw new Error("Email hoặc mật khẩu không đúng")
      }

      // Tạo User object từ account (không lưu password)
      const user: User = {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        role: account.role || "user",
        permission: account.permission || "user",
      }

      // Lưu user vào state và localStorage
      setUser(user)
      localStorage.setItem("currentUser", JSON.stringify(user))
      window.location.reload() // Reload trang để cập nhật UI
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ===== HÀM LOGOUT: Đăng xuất khỏi hệ thống =====
  const logout = useCallback(() => {
    // Xóa user hiện tại
    setUser(null)
    // Xóa dữ liệu currentUser từ localStorage
    localStorage.removeItem("currentUser")
    // Quay về trang home
    window.location.href = "/"
  }, [])

  // ===== HÀM CREATE USER BY ADMIN: Admin tạo user mới =====
  const createUserByAdmin = useCallback(
    async (email: string, password: string, fullName: string, permission: "user" | "room_creator") => {
      try {
        // Lấy danh sách accounts
        const accountsStr = localStorage.getItem("accounts")
        const accounts = accountsStr ? JSON.parse(accountsStr) : []

        // Kiểm tra email đã tồn tại
        if (accounts.some((acc: any) => acc.email === email)) {
          throw new Error("Email đã được đăng ký")
        }

        // Tính ID mới
        const regularUsers = accounts.filter((acc: any) => acc.role !== "admin")
        const newId = (regularUsers.length + 1).toString()

        // Tạo account mới với quyền hạn được chọn
        const newAccount = {
          id: newId,
          email,
          password,
          fullName,
          role: "user",
          permission: permission, // Quyền được chọn bởi admin
          createdAt: new Date().toISOString(),
        }

        // Lưu vào localStorage
        accounts.push(newAccount)
        localStorage.setItem("accounts", JSON.stringify(accounts))
      } catch (error) {
        throw error
      }
    },
    [],
  )

  // Trả về object chứa user, state và tất cả các hàm
  return {
    user,
    isLoading,
    login,
    register,
    logout,
    createUserByAdmin,
  }
}