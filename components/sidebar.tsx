"use client"
import { LayoutDashboard, Users, Cog as Cog2, Building2, BarChart3 } from "lucide-react"
import type { User } from "@/hooks/use-auth"

export default function Sidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  user,
  onMenuToggle,
}: {
  isOpen: boolean
  onClose: () => void
  activeTab: "dashboard" | "users" | "devices" | "rooms" | "reports"
  onTabChange: (tab: "dashboard" | "users" | "devices" | "rooms" | "reports") => void
  user: User
  onMenuToggle: () => void
}) {
  const isAdmin = user.role === "admin"

  const handleTabClick = (tab: "dashboard" | "users" | "devices" | "rooms" | "reports") => {
    onTabChange(tab)
    onClose()
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />}

      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border shadow-lg transition-all duration-300 z-40 overflow-y-auto flex flex-col ${
          isOpen ? "w-64" : "w-0"
        }`}
      >
        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {/* Dashboard */}
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => handleTabClick("dashboard")}
          />

          {isAdmin && (
            <>
              <SidebarItem
                icon={Users}
                label="Người dùng & quyền hạn"
                active={activeTab === "users"}
                onClick={() => handleTabClick("users")}
              />

              <SidebarItem
                icon={Cog2}
                label="Quản lý thiết bị"
                active={activeTab === "devices"}
                onClick={() => handleTabClick("devices")}
              />

              <SidebarItem
                icon={Building2}
                label="Quản lý phòng họp"
                active={activeTab === "rooms"}
                onClick={() => handleTabClick("rooms")}
              />

              <SidebarItem
                icon={BarChart3}
                label="Thống kê và báo cáo"
                active={activeTab === "reports"}
                onClick={() => handleTabClick("reports")}
              />
            </>
          )}
        </nav>
      </div>
    </>
  )
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm font-medium ${
        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  )
}