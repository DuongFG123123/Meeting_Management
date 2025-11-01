"use client"

import { useState, useEffect } from "react"
import { Bell, Settings, UserIcon, Menu, X, Moon, Sun, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { User } from "@/hooks/use-auth"

export default function Header({
  user,
  activeTab,
  onTabChange,
  isAdmin,
}: {
  user: User
  activeTab?: "dashboard" | "users"
  onTabChange?: (tab: "dashboard" | "users") => void
  isAdmin?: boolean
}) {
  const { logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light")

    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: "light" | "dark") => {
    localStorage.setItem("theme", newTheme)
    const html = document.documentElement
    if (newTheme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onTabChange?.("dashboard")}
            className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <span className="text-lg font-bold text-primary-foreground">📅</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MeetFlow</h1>
              <p className="text-xs text-muted-foreground">Quản lý cuộc họp</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem label="Dashboard" active={activeTab === "dashboard"} onClick={() => onTabChange?.("dashboard")} />
            {isAdmin && (
              <NavItem label="Quản lý User" active={activeTab === "users"} onClick={() => onTabChange?.("users")} />
            )}
            <NavItem label="Báo cáo" />
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-lg transition">
              <Bell size={20} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"></span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-foreground">
                <UserIcon size={18} />
                <span className="hidden sm:inline text-sm font-medium">{user.fullName}</span>
                {isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-semibold">
                    Admin
                  </span>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                  className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition"
                  title="Cài đặt"
                >
                  <Settings size={20} />
                </button>

                {settingsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                    <button
                      onClick={toggleTheme}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition rounded-t-lg flex items-center gap-2"
                    >
                      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                      {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
                    </button>
                    <button
                      onClick={() => {
                        setSettingsMenuOpen(false)
                        // TODO: Add settings page functionality
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition flex items-center gap-2"
                    >
                      <Settings size={16} />
                      Cài đặt
                    </button>
                    <button
                      onClick={() => {
                        setSettingsMenuOpen(false)
                        logout()
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition rounded-b-lg flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-muted-foreground hover:bg-muted rounded-lg transition"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              <MobileNavItem
                label="Dashboard"
                active={activeTab === "dashboard"}
                onClick={() => {
                  onTabChange?.("dashboard")
                  setMobileMenuOpen(false)
                }}
              />
              {isAdmin && (
                <MobileNavItem
                  label="Quản lý User"
                  active={activeTab === "users"}
                  onClick={() => {
                    onTabChange?.("users")
                    setMobileMenuOpen(false)
                  }}
                />
              )}
              <MobileNavItem label="Báo cáo" />
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

function NavItem({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition cursor-pointer ${
        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  )
}

function MobileNavItem({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg text-left transition cursor-pointer ${
        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  )
}
