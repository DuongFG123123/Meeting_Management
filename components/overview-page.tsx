"use client"
import { useState } from "react"
import StatsCharts from "./stats-charts"
import UpcomingMeetings from "./upcoming-meetings"
import QuickActions from "./quick-actions"
import Header from "./header"
import UserManagement from "./user-management"
import type { User } from "@/hooks/use-auth"

export default function OverviewPage({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "users">("dashboard")

  const isAdmin = user.role === "admin"

  // Reset tab to dashboard if non-admin tries to access users
  const handleTabChange = (tab: "dashboard" | "users") => {
    if (tab === "users" && !isAdmin) return
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header user={user} activeTab={activeTab} onTabChange={handleTabChange} isAdmin={isAdmin} />

      {/* Main Content */}
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
        ) : (
          <UserManagement />
        )}
      </div>
    </div>
  )
}
