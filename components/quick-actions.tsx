"use client"

import type React from "react"
import { Plus, Calendar, Users, Download, BarChart3, Zap } from "lucide-react"

interface ActionItem {
  id: string
  icon: React.ElementType
  label: string
  description: string
  color: string
  action: string
}

const actions: ActionItem[] = [
  {
    id: "1",
    icon: Plus,
    label: "Đặt cuộc họp mới",
    description: "Tạo cuộc họp mới ngay lập tức",
    color: "blue",
    action: "create",
  },
  {
    id: "2",
    icon: Calendar,
    label: "Xem lịch tuần",
    description: "Xem tất cả cuộc họp trong tuần",
    color: "purple",
    action: "view-week",
  },
  {
    id: "3",
    icon: Users,
    label: "Quản lý nhóm",
    description: "Thêm/xóa thành viên nhóm",
    color: "green",
    action: "manage-team",
  },
  {
    id: "4",
    icon: Download,
    label: "Xuất báo cáo",
    description: "Xuất báo cáo chi tiết",
    color: "orange",
    action: "export",
  },
]

export default function QuickActions() {
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; hover: string }> = {
      blue: {
        bg: "bg-blue-500/10 dark:bg-blue-500/20",
        icon: "text-blue-600 dark:text-blue-400",
        hover: "hover:bg-blue-500/20 dark:hover:bg-blue-500/30",
      },
      purple: {
        bg: "bg-purple-500/10 dark:bg-purple-500/20",
        icon: "text-purple-600 dark:text-purple-400",
        hover: "hover:bg-purple-500/20 dark:hover:bg-purple-500/30",
      },
      green: {
        bg: "bg-green-500/10 dark:bg-green-500/20",
        icon: "text-green-600 dark:text-green-400",
        hover: "hover:bg-green-500/20 dark:hover:bg-green-500/30",
      },
      orange: {
        bg: "bg-orange-500/10 dark:bg-orange-500/20",
        icon: "text-orange-600 dark:text-orange-400",
        hover: "hover:bg-orange-500/20 dark:hover:bg-orange-500/30",
      },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden p-6">
        <h3 className="mb-4 text-lg font-bold text-foreground">Hành động nhanh</h3>

        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon
            const colorClasses = getColorClasses(action.color)
            return (
              <button
                key={action.id}
                className="group w-full rounded-lg border border-border bg-muted/30 p-4 text-left hover:border-border/80 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`${colorClasses.bg} ${colorClasses.hover} rounded-lg p-3 transition flex-shrink-0`}>
                    <Icon className={`${colorClasses.icon}`} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                  </div>
                  <ChevronIcon className="shrink-0" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Productivity Tips */}
      <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg overflow-hidden p-6 text-primary-foreground">
        <div className="flex items-start gap-3 mb-3">
          <Zap size={24} className="text-primary-foreground/80 flex-shrink-0" />
          <h3 className="text-lg font-bold leading-tight">Mẹo năng suất</h3>
        </div>
        <p className="text-sm text-primary-foreground/90 mb-4">
          Hãy đặt lịch họp trước 24 giờ để các thành viên có đủ thời gian chuẩn bị
        </p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground text-primary font-medium px-4 py-2 hover:bg-primary-foreground/90 transition text-sm">
          Tìm hiểu thêm
          <ChevronRightIcon size={16} />
        </button>
      </div>

      {/* Statistics Summary */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-6">
        <h3 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
          <BarChart3 size={20} className="text-muted-foreground" />
          Thống kê tuần
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tổng cuộc họp</span>
            <span className="font-semibold text-foreground">12</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tổng thời gian</span>
            <span className="font-semibold text-foreground">18h 30m</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trung bình/ngày</span>
            <span className="font-semibold text-foreground">2.5 giờ</span>
          </div>
          <div className="h-1.5 mt-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-primary/60" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`w-5 h-5 text-muted-foreground group-hover:text-foreground transition ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function ChevronRightIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
