"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Facebook, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

// ===== COMPONENT: Auth Form (Đăng nhập / Đăng ký) =====
export default function AuthForm() {
  const { login, register, loginWithProvider } = useAuth() // ✅ thêm loginWithProvider

  // State: isLogin = true (đăng nhập), isLogin = false (đăng ký)
  const [isLogin, setIsLogin] = useState(true)

  // State: đang xử lý request (hiển thị loading)
  const [isLoading, setIsLoading] = useState(false)

  // State: thông báo thành công
  const [successMessage, setSuccessMessage] = useState("")

  // State: thông báo lỗi
  const [errorMessage, setErrorMessage] = useState("")

  // State: dữ liệu form (email, password, fullName)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })
  

  // ===== HÀM: Cập nhật input field =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Xóa thông báo khi user nhập
    setErrorMessage("")
    setSuccessMessage("")
  }

  // ===== HÀM: Submit form (Đăng nhập hoặc Đăng ký) =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      if (isLogin) {
        // Nếu là đăng nhập: gọi hàm login
        await login(formData.email, formData.password)
        window.location.reload()
      } else {
        // Nếu là đăng ký: kiểm tra fullName
        if (!formData.fullName.trim()) {
          throw new Error("Vui lòng nhập họ và tên")
        }
        // 🧠 Kiểm tra mật khẩu xác nhận có khớp không
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Mật khẩu xác nhận không khớp") // 🆕 thêm kiểm tra
        }
        // Gọi hàm register
        await register(formData.email, formData.password, formData.fullName)
        // Sau đó tự động đăng nhập
        await login(formData.email, formData.password)
        window.location.reload()
      }
    } catch (error) {
      // Hiển thị lỗi nếu có
      setErrorMessage(error instanceof Error ? error.message : "Có lỗi xảy ra")
      setIsLoading(false)
    }
  }

  // ===== HÀM: Đăng nhập qua Google / Facebook =====
  const handleOAuth = async (provider: "google" | "facebook") => {
    try {
      setIsLoading(true)
      await loginWithProvider(provider)
      window.location.reload()
    } catch (error) {
      setErrorMessage("Không thể đăng nhập bằng " + provider)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <span className="text-2xl">📅</span>
            </div>
          </div>

          {/* Tiêu đề */}
          <CardTitle className="text-center text-2xl">MeetFlow</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Đăng nhập vào tài khoản" : "Tạo tài khoản mới"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Thông báo thành công */}
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm text-green-700 dark:text-green-300">
              <CheckCircle size={18} />
              {successMessage}
            </div>
          )}

          {/* Thông báo lỗi */}
          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
              <AlertCircle size={18} />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Họ và tên (chỉ hiển thị khi đang đăng ký) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và Tên</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Nhập họ và tên"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={!isLogin}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Input Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Input Mật khẩu */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
             {/* 🆕 Thêm ô Xác nhận mật khẩu (chỉ khi đăng ký) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Nút submit */}
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : null}
              {isLoading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
            </Button>
          </form>

          {/* ===== Nút đăng nhập bằng Google / Facebook ===== */}
          <div className="flex flex-col gap-2 mt-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleOAuth("google")}
              disabled={isLoading}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Đăng nhập với Google
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleOAuth("facebook")}
              disabled={isLoading}
            >
              <Facebook className="text-blue-600 h-5 w-5" />
              Đăng nhập với Facebook
            </Button>
          </div>

          {/* Dòng phân cách */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">hoặc</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Nút chuyển đổi giữa Đăng nhập / Đăng ký */}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setErrorMessage("")
              setSuccessMessage("")
              setFormData({ email: "", password: "", fullName: "",confirmPassword: "" })
            }}
            className="mt-4 w-full text-sm text-primary hover:text-primary/80 font-medium transition"
          >
            {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
