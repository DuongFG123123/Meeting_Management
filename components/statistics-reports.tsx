"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ["#6b21a8", "#2563eb", "#16a34a", "#ea580c", "#dc2626"]

export default function StatisticsReports() {
  const [statsData, setStatsData] = useState({
    totalMeetings: 45,
    totalUsers: 28,
    totalDevices: 15,
    totalRooms: 8,
    monthlyData: [
      { month: "Tháng 1", meetings: 10 },
      { month: "Tháng 2", meetings: 14 },
      { month: "Tháng 3", meetings: 12 },
      { month: "Tháng 4", meetings: 18 },
      { month: "Tháng 5", meetings: 22 },
      { month: "Tháng 6", meetings: 16 },
    ],
    roomUsage: [
      { name: "Phòng A", value: 35 },
      { name: "Phòng B", value: 28 },
      { name: "Phòng C", value: 22 },
      { name: "Phòng D", value: 15 },
    ],
    deviceStatus: [
      { name: "Hoạt động", value: 12 },
      { name: "Bảo trì", value: 2 },
      { name: "Không hoạt động", value: 1 },
    ],
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Thống kê và báo cáo</h2>
        <p className="text-muted-foreground mt-1">Tổng quan dữ liệu hệ thống</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng cuộc họp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{statsData.totalMeetings}</div>
            <p className="text-xs text-muted-foreground mt-1">Trong 6 tháng qua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{statsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Tài khoản hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Thiết bị</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{statsData.totalDevices}</div>
            <p className="text-xs text-muted-foreground mt-1">Được quản lý</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Phòng họp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{statsData.totalRooms}</div>
            <p className="text-xs text-muted-foreground mt-1">Sẵn sàng sử dụng</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line Chart: Monthly Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Cuộc họp theo tháng</CardTitle>
            <CardDescription>Biểu đồ số cuộc họp hàng tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="meetings"
                  stroke="#6b21a8"
                  strokeWidth={2}
                  dot={{ fill: "#6b21a8", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Room Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Sử dụng phòng họp</CardTitle>
            <CardDescription>Tỷ lệ sử dụng các phòng</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statsData.roomUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statsData.roomUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Device Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trạng thái thiết bị</CardTitle>
            <CardDescription>Phân loại thiết bị theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData.deviceStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#6b21a8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Danh sách hoạt động mới nhất trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Cuộc họp mới được tạo", time: "2 giờ trước", user: "Admin" },
              { action: "Thiết bị được thêm vào", time: "4 giờ trước", user: "Admin" },
              { action: "Phòng họp được cập nhật", time: "1 ngày trước", user: "Admin" },
              { action: "Người dùng mới đăng ký", time: "2 ngày trước", user: "System" },
              { action: "Báo cáo định kỳ được tạo", time: "3 ngày trước", user: "Admin" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">Bởi {activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
