"use client"
import { useState } from "react"
import StatsCharts from "./stats-charts"
import UpcomingMeetings from "./upcoming-meetings"
import QuickActions from "./quick-actions"
import Header from "./header"
import Sidebar from "./sidebar"
import UserManagement from "./user-management"
import DeviceManagement from "./device-management"
import MeetingRoomManagement from "./meeting-room-management"
import StatisticsReports from "./statistics-reports"
import type { User } from "@/hooks/use-auth"

export default function OverviewPage({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "devices" | "rooms" | "reports">("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = user.role === "admin"

  const handleTabChange = (tab: "dashboard" | "users" | "devices" | "rooms" | "reports") => {
    if (tab !== "dashboard" && !isAdmin) return
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={user}
        />

        {/* Main Content */}
        <div className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {activeTab === "dashboard" ? (
              <>
                {/* Stats Grid */}
                <StatsCharts />

                {/* Main Grid */}
                <div className="grid gap-8 lg:grid-cols-3 mt-8">
                  {/* Upcoming Meetings */}
                  <div className="lg:col-span-2">
                    <UpcomingMeetings />
                  </div>

                  {/* Right Sidebar */}
                  <div className="space-y-6">
                    <QuickActions />
                  </div>
                </div>
              </>
            ) : activeTab === "users" ? (
              <UserManagement />
            ) : activeTab === "devices" ? (
              <DeviceManagement />
            ) : activeTab === "rooms" ? (
              <MeetingRoomManagement />
            ) : (
              <StatisticsReports />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}