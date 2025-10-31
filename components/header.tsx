"use client"

import { useState, useEffect } from "react"
import { Bell, Settings, User, Menu, X, Moon, Sun } from "lucide-react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <span className="text-lg font-bold text-primary-foreground">📅</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MeetFlow</h1>
              <p className="text-xs text-muted-foreground">Quản lý cuộc họp</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem label="Dashboard" active />
            <NavItem label="Cuộc họp" />
            <NavItem label="Báo cáo" />
            <NavItem label="Cài đặt" />
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-lg transition">
              <Bell size={20} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"></span>
            </button>
            <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition hidden sm:block">
              <Settings size={20} />
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-foreground hover:bg-muted/80 transition">
              <User size={18} />
              <span className="hidden sm:inline text-sm font-medium">Admin</span>
            </button>

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
              <MobileNavItem label="Dashboard" active />
              <MobileNavItem label="Cuộc họp" />
              <MobileNavItem label="Báo cáo" />
              <MobileNavItem label="Cài đặt" />
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  )
}

function MobileNavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-lg text-left transition ${
        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  )
}
