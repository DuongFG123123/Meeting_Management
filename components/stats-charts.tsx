"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Calendar, Clock, Users, TrendingUp } from "lucide-react"

const meetingsData = [
  { day: "Th 2", meetings: 4, hours: 3 },
  { day: "Th 3", meetings: 6, hours: 5 },
  { day: "Th 4", meetings: 3, hours: 2 },
  { day: "Th 5", meetings: 5, hours: 4 },
  { day: "Th 6", meetings: 7, hours: 6 },
  { day: "Th 7", meetings: 2, hours: 1 },
  { day: "CN", meetings: 4, hours: 3 },
]

const attendeesData = [
  { name: "Nội bộ", value: 45 },
  { name: "Khách hàng", value: 25 },
  { name: "Partner", value: 20 },
  { name: "Khác", value: 10 },
]

const platformData = [
  { name: "Zoom", value: 35 },
  { name: "Teams", value: 25 },
  { name: "Google Meet", value: 20 },
  { name: "Hybrid", value: 20 },
]

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const index = attendeesData.findIndex((item) => item.name === data.name)
    const color = COLORS[index % COLORS.length]

    return (
      <div
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          padding: "8px 12px",
        }}
      >
        <p style={{ color: color, fontWeight: "500", margin: "0" }}>
          {data.name}: {data.value}%
        </p>
      </div>
    )
  }
  return null
}

export default function StatsCharts() {
  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
        <StatBox icon={Calendar} label="Hôm nay" value="4" subtext="cuộc họp" />
        <StatBox icon={Calendar} label="Tuần này" value="12" subtext="cuộc họp" />
        <StatBox icon={Users} label="Người tham gia" value="28" subtext="người" />
        <StatBox icon={Clock} label="Thời gian họp" value="18h" subtext="tổng cộng" />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Meetings Per Day Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Cuộc họp theo ngày
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={meetingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend />
              <Bar dataKey="meetings" fill="#3b82f6" name="Số cuộc họp" radius={[8, 8, 0, 0]} />
              <Bar dataKey="hours" fill="#8b5cf6" name="Giờ họp" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendees Distribution */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Phân bố người tham gia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendeesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attendeesData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Line Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">Xu hướng tham gia (2 tuần qua)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={meetingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="meetings"
                stroke="#3b82f6"
                name="Cuộc họp"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#ec4899"
                name="Giờ họp"
                strokeWidth={2}
                dot={{ fill: "#ec4899" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function StatBox({ icon: Icon, label, value, subtext }: { icon: any; label: string; value: string; subtext: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{subtext}</p>
          </div>
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="text-primary" size={24} />
        </div>
      </div>
    </div>
  )
}