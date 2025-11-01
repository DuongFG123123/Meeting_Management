"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function AuthForm() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrorMessage("")
    setSuccessMessage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
        window.location.reload()
      } else {
        if (!formData.fullName.trim()) {
          throw new Error("Vui lòng nhập họ và tên")
        }
        await register(formData.email, formData.password, formData.fullName)
        await login(formData.email, formData.password)
        window.location.reload()
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Có lỗi xảy ra")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <span className="text-2xl">📅</span>
            </div>
          </div>
          <CardTitle className="text-center text-2xl">MeetFlow</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Đăng nhập vào tài khoản" : "Tạo tài khoản mới"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm text-green-700 dark:text-green-300">
              <CheckCircle size={18} />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
              <AlertCircle size={18} />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">hoặc</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setErrorMessage("")
              setSuccessMessage("")
              setFormData({ email: "", password: "", fullName: "" })
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