"use client"
import StatsCharts from "./stats-charts"
import UpcomingMeetings from "./upcoming-meetings"
import QuickActions from "./quick-actions"
import Header from "./header"

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
      </div>
    </div>
  )
}
