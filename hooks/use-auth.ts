"use client"
import { useState, useEffect, useCallback } from "react"

export interface User {
  id: string
  email: string
  fullName: string
  role: "admin" | "user"
  permission: "user" | "room_creator"
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  createUserByAdmin: (
    email: string,
    password: string,
    fullName: string,
    permission: "user" | "room_creator",
  ) => Promise<void>
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("currentUser")
      }
    }
    setIsLoading(false)
  }, [])

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true)
    try {
      const accountsStr = localStorage.getItem("accounts")
      const accounts = accountsStr ? JSON.parse(accountsStr) : []

      if (accounts.some((acc: any) => acc.email === email)) {
        throw new Error("Email đã được đăng ký")
      }

      const regularUsers = accounts.filter((acc: any) => acc.role !== "admin")
      const newId = (regularUsers.length + 1).toString()

      const newAccount = {
        id: newId,
        email,
        password,
        fullName,
        role: "user",
        permission: "user",
        createdAt: new Date().toISOString(),
      }

      accounts.push(newAccount)
      localStorage.setItem("accounts", JSON.stringify(accounts))

      const user: User = {
        id: newId,
        email,
        fullName,
        role: "user",
        permission: "user",
      }
      setUser(user)
      localStorage.setItem("currentUser", JSON.stringify(user))
      window.location.reload()
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const accountsStr = localStorage.getItem("accounts")
      const accounts = accountsStr ? JSON.parse(accountsStr) : []

      const account = accounts.find((acc: any) => acc.email === email && acc.password === password)

      if (!account) {
        throw new Error("Email hoặc mật khẩu không đúng")
      }

      const user: User = {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        role: account.role || "user",
        permission: account.permission || "user",
      }

      setUser(user)
      localStorage.setItem("currentUser", JSON.stringify(user))
      window.location.reload()
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("currentUser")
    window.location.href = "/"
  }, [])

  const createUserByAdmin = useCallback(
    async (email: string, password: string, fullName: string, permission: "user" | "room_creator") => {
      try {
        const accountsStr = localStorage.getItem("accounts")
        const accounts = accountsStr ? JSON.parse(accountsStr) : []

        if (accounts.some((acc: any) => acc.email === email)) {
          throw new Error("Email đã được đăng ký")
        }

        const regularUsers = accounts.filter((acc: any) => acc.role !== "admin")
        const newId = (regularUsers.length + 1).toString()

        const newAccount = {
          id: newId,
          email,
          password,
          fullName,
          role: "user",
          permission: permission,
          createdAt: new Date().toISOString(),
        }

        accounts.push(newAccount)
        localStorage.setItem("accounts", JSON.stringify(accounts))
      } catch (error) {
        throw error
      }
    },
    [],
  )

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    createUserByAdmin,
  }
}
