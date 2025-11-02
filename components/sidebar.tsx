"use client"
import { LayoutDashboard, Users, Cog as Cog2, Building2, BarChart3, ChevronLeft, ChevronRight } from "lucide-react"
import type { User } from "@/hooks/use-auth"

export default function Sidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  user,
  onToggleCollapse,
  isCollapsed,
}: {
  isOpen: boolean
  onClose: () => void
  activeTab: "dashboard" | "users" | "devices" | "rooms" | "reports"
  onTabChange: (tab: "dashboard" | "users" | "devices" | "rooms" | "reports") => void
  user: User
  onToggleCollapse: () => void
  isCollapsed: boolean
}) {
  const isAdmin = user.role === "admin"

  const handleTabClick = (tab: "dashboard" | "users" | "devices" | "rooms" | "reports") => {
    onTabChange(tab)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border shadow-lg transform transition-all duration-300 z-40 overflow-y-auto flex flex-col ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Collapse Button - Desktop Only */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex absolute -right-3 top-4 p-1 bg-card border border-border text-muted-foreground hover:bg-muted rounded-full transition"
          title="Thu gọn"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Logo Section - Show only when collapsed */}
        {isCollapsed && (
          <div className="flex items-center justify-center h-16 border-b border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <span className="text-sm font-bold text-primary-foreground">📅</span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className={`flex flex-col gap-1 ${isCollapsed ? "p-2" : "p-4"} flex-1`}>
          {/* Dashboard */}
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => handleTabClick("dashboard")}
            isCollapsed={isCollapsed}
          />

          {isAdmin && (
            <>
              <SidebarItem
                icon={Users}
                label="Người dùng & quyền hạn"
                active={activeTab === "users"}
                onClick={() => handleTabClick("users")}
                isCollapsed={isCollapsed}
              />

              <SidebarItem
                icon={Cog2}
                label="Quản lý thiết bị"
                active={activeTab === "devices"}
                onClick={() => handleTabClick("devices")}
                isCollapsed={isCollapsed}
              />

              <SidebarItem
                icon={Building2}
                label="Quản lý phòng họp"
                active={activeTab === "rooms"}
                onClick={() => handleTabClick("rooms")}
                isCollapsed={isCollapsed}
              />

              <SidebarItem
                icon={BarChart3}
                label="Thống kê và báo cáo"
                active={activeTab === "reports"}
                onClick={() => handleTabClick("reports")}
                isCollapsed={isCollapsed}
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
  isCollapsed,
}: {
  icon: any
  label: string
  active: boolean
  onClick: () => void
  isCollapsed: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm font-medium ${
        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      } ${isCollapsed ? "justify-center px-2" : ""}`}
      title={isCollapsed ? label : ""}
    >
      <Icon size={18} />
      {!isCollapsed && <span>{label}</span>}
    </button>
  )
}