import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theo dõi dark mode hiện tại
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Dữ liệu
  const meetingsData = [
    { name: "T1", value: 8 },
    { name: "T2", value: 12 },
    { name: "T3", value: 15 },
    { name: "T4", value: 18 },
    { name: "T5", value: 22 },
    { name: "T6", value: 30 },
  ];

  const roomUsage = [
    { name: "Phòng A", value: 28, color: "#6366f1" },
    { name: "Phòng B", value: 22, color: "#10b981" },
    { name: "Phòng C", value: 33, color: "#f59e0b" },
    { name: "Phòng D", value: 15, color: "#ec4899" },
  ];

  const deviceStatus = [
    { name: "Hoạt động", value: 14, color: "#10b981" },
    { name: "Bảo trì", value: 3, color: "#f59e0b" },
    { name: "Không hoạt động", value: 6, color: "#94a3b8" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Thống kê & báo cáo
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tổng quan dữ liệu hệ thống
        </p>
      </div>

      {/* Cards thống kê */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { title: "Tổng cuộc họp", value: 45 },
          { title: "Người dùng", value: 28 },
          { title: "Thiết bị", value: 15 },
          { title: "Thiết bị đang dùng", value: 8 },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors"
          >
            <h2 className="text-sm text-gray-500 dark:text-gray-400">
              {item.title}
            </h2>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {item.value}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Trong hệ thống
            </p>
          </div>
        ))}
      </div>

      {/* Biểu đồ cuộc họp và phòng họp */}
      <div className="grid grid-cols-2 gap-6">
        {/* Line Chart: Cuộc họp theo tháng */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Cuộc họp theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={meetingsData}>
              <XAxis
                dataKey="name"
                stroke={isDarkMode ? "#cbd5e1" : "#475569"}
              />
              <YAxis stroke={isDarkMode ? "#cbd5e1" : "#475569"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                  color: isDarkMode ? "#f8fafc" : "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isDarkMode ? "#818cf8" : "#3b82f6"}
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Tỉ lệ sử dụng phòng họp */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Tỉ lệ sử dụng phòng họp
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roomUsage}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {roomUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                  color: isDarkMode ? "#f8fafc" : "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biểu đồ trạng thái thiết bị */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Trạng thái thiết bị
        </h3>

        {/* Biểu đồ cột */}
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={deviceStatus} barCategoryGap="25%">
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDarkMode ? "#334155" : "#e5e7eb"}
            />
            <XAxis
              dataKey="name"
              stroke={isDarkMode ? "#cbd5e1" : "#475569"}
            />
            <YAxis stroke={isDarkMode ? "#cbd5e1" : "#475569"} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                color: isDarkMode ? "#f8fafc" : "#1e293b",
                border: "none",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {deviceStatus.map((d, i) => (
                <Cell key={`cell-${i}`} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Dòng thống kê tổng quan bên dưới */}
        <div className="flex justify-around text-sm text-gray-600 dark:text-gray-300 mt-4">
          {deviceStatus.map((d, i) => (
            <div key={i} className="text-center">
              <p className="font-semibold text-lg">{d.value}</p>
              <p>{d.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
